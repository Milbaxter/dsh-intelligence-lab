import { hostname } from "node:os";
import { ablationTarget, applyReviewActions, isAblation } from "./apply";
import { composeSetup } from "./compose";
import { decideKeep, summarizeSetup } from "./decision";
import { commitLabData } from "./git";
import { clearStop, stopRequested, withLock } from "./lock";
import { runMetaReview, shouldReview } from "./meta";
import { assertCheapEvalModel } from "./models";
import { scoreSetup } from "./scorer";
import { createExperiment, loadCatalog, loadExperiment, saveExperiment, saveWorkerStatus } from "./store";
import type { ExperimentState, RepeatScore, Trial } from "./types";

export interface StepResult {
  state: ExperimentState;
  trial: Trial | null;
  message: string;
}

export async function runSteps(count: number, cwd = process.cwd()): Promise<ExperimentState> {
  return withLock(cwd, async () => {
    let state = loadExperiment(cwd);
    state.config.evalModel = assertCheapEvalModel(state.config.evalModel);
    state.status = "running";
    state.error = undefined;
    applyPendingReviews(state, cwd);
    saveExperiment(state, cwd);
    beat(state, cwd, `Running ${count} step(s)`);

    try {
      for (let i = 0; i < count; i++) {
        if (stopRequested(cwd)) {
          state.status = "idle";
          saveExperiment(state, cwd);
          beat(state, cwd, "Stopped by request");
          clearStop(cwd);
          return state;
        }
        const result = await stepOnce(state, cwd);
        state = result.state;
        saveExperiment(state, cwd);
        if (state.config.autoCommit && result.trial) {
          commitLabData(
            `lab: ${result.trial.decision} ${result.trial.candidateName}`,
            cwd,
          );
        }
        if (!result.trial && state.queue.length === 0 && state.championScore) {
          break;
        }
      }
      state.status = "idle";
      saveExperiment(state, cwd);
      beat(state, cwd, "Idle");
      return state;
    } catch (error) {
      state.status = "error";
      state.error = error instanceof Error ? error.message : String(error);
      saveExperiment(state, cwd);
      beat(state, cwd, state.error);
      throw error;
    }
  });
}

export async function runDaemon(maxSteps = 200, cwd = process.cwd()): Promise<ExperimentState> {
  clearStop(cwd);
  return runSteps(maxSteps, cwd);
}

export async function stepOnce(state: ExperimentState, cwd = process.cwd()): Promise<StepResult> {
  if (!state.championScore) {
    const trial = await evaluateCandidate(state, {
      candidateId: "baseline",
      candidateName: "Default DSH plugins",
      pluginIds: [],
      decisionForce: "baseline",
      cwd,
    });
    state.championPluginIds = [];
    state.championScore = trial.candidateScore;
    state.trials.push(trial);
    await maybeReview(state, cwd);
    return {
      state,
      trial,
      message: `Baseline ${fmt(trial.candidateScore.meanResolveRate)} on ${trial.instances} instances × ${state.config.repeats} repeats.`,
    };
  }

  const candidateId = state.queue.shift();
  if (!candidateId) {
    return { state, trial: null, message: "Queue is empty. Champion is frozen." };
  }

  if (isAblation(candidateId)) {
    return runAblation(state, candidateId, cwd);
  }

  const catalog = new Map(loadCatalog(cwd).map((item) => [item.id, item]));
  const plugin = catalog.get(candidateId);
  if (!plugin) {
    state.skipped.push({ id: candidateId, reason: "Not in catalog" });
    return { state, trial: null, message: `Skipped unknown plugin ${candidateId}.` };
  }

  if (plugin.breaksCheapEval && state.config.mode === "live") {
    state.skipped.push({
      id: candidateId,
      reason: "Breaks cheap-eval contract (routes work to a smart/paid model).",
    });
    return {
      state,
      trial: null,
      message: `Skipped ${plugin.name} — live benchmarks stay on ${state.config.evalModel}.`,
    };
  }

  if (plugin.kind === "idea" && state.config.mode === "dry") {
    state.skipped.push({
      id: candidateId,
      reason: "Ideas have no installable plugin. Implement a remix before dry-run can score them.",
    });
    return {
      state,
      trial: null,
      message: `Skipped idea ${plugin.name} — dry-run cannot invent a SWE-bench score for a pitch.`,
    };
  }

  if (state.championPluginIds.includes(candidateId)) {
    state.skipped.push({ id: candidateId, reason: "Already in champion" });
    return { state, trial: null, message: `${plugin.name} already kept.` };
  }

  const tested = [...state.championPluginIds, candidateId];
  const trial = await evaluateCandidate(state, {
    candidateId,
    candidateName: plugin.name,
    pluginIds: tested,
    cwd,
  });

  if (trial.decision === "keep") {
    state.championPluginIds = tested;
    state.championScore = trial.candidateScore;
  }
  state.trials.push(trial);
  await maybeReview(state, cwd);

  return {
    state,
    trial,
    message: `${trial.decision.toUpperCase()} ${plugin.name}: ${trial.reason}`,
  };
}

async function runAblation(
  state: ExperimentState,
  token: string,
  cwd: string,
): Promise<StepResult> {
  const target = ablationTarget(token);
  if (!state.championPluginIds.includes(target) || !state.championScore) {
    state.skipped.push({ id: token, reason: `${target} is not in the champion` });
    return { state, trial: null, message: `Ablation skipped: ${target} is not kept.` };
  }

  const without = state.championPluginIds.filter((id) => id !== target);
  const trial = await evaluateCandidate(state, {
    candidateId: token,
    candidateName: `ablate ${target}`,
    pluginIds: without,
    cwd,
  });

  const judged = decideKeep(trial.candidateScore, state.championScore, state.config);
  if (!judged.keep) {
    trial.decision = "ablate-drop";
    trial.reason = `Removing ${target} did not hurt the score (${fmt(trial.candidateScore.meanResolveRate)} vs champion ${fmt(state.championScore.meanResolveRate)}). Dropped from the stack.`;
    trial.deltaPp = trial.candidateScore.meanResolveRate - state.championScore.meanResolveRate;
    state.championPluginIds = without;
    state.championScore = trial.candidateScore;
  } else {
    trial.decision = "ablate-keep";
    trial.reason = `Removing ${target} made the stack worse. It stays. ${judged.reason}`;
    trial.deltaPp = trial.candidateScore.meanResolveRate - state.championScore.meanResolveRate;
  }

  if (state.config.mode === "dry") {
    trial.reason += " Simulated from catalog priors — not SWE-bench.";
  }

  state.trials.push(trial);
  await maybeReview(state, cwd);
  return { state, trial, message: trial.reason };
}

async function evaluateCandidate(
  state: ExperimentState,
  args: {
    candidateId: string;
    candidateName: string;
    pluginIds: string[];
    decisionForce?: Trial["decision"];
    cwd: string;
  },
): Promise<Trial> {
  const setupId = `${String(state.trials.length + 1).padStart(3, "0")}-${args.candidateId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  composeSetup(setupId, args.pluginIds, state.config.profile, args.cwd, state.config.evalModel);

  const repeats: RepeatScore[] = [];
  for (let i = 0; i < state.config.repeats; i++) {
    repeats.push(
      await scoreSetup({
        setupId,
        pluginIds: args.pluginIds,
        seed: state.rngSeed + state.trials.length * 10 + i,
        config: state.config,
        cwd: args.cwd,
      }),
    );
  }

  const candidateScore = summarizeSetup(setupId, args.pluginIds, repeats);
  const championScore = state.championScore ?? candidateScore;
  const judged =
    args.decisionForce === "baseline"
      ? {
          keep: true,
          deltaPp: 0,
          reason: "First run. Default DeepSeek Harness plugins are the champion until something beats them.",
        }
      : decideKeep(championScore, candidateScore, state.config);

  const simulated = state.config.mode === "dry";
  const trial: Trial = {
    id: setupId,
    createdAt: new Date().toISOString(),
    candidateId: args.candidateId,
    candidateName: args.candidateName,
    championPluginIds: [...state.championPluginIds],
    testedPluginIds: args.pluginIds,
    championScore,
    candidateScore,
    deltaPp: judged.deltaPp,
    decision: args.decisionForce ?? (judged.keep ? "keep" : "drop"),
    reason: simulated
      ? `${judged.reason} Simulated from catalog priors — not SWE-bench.`
      : judged.reason,
    mode: state.config.mode,
    model: state.config.evalModel,
    split: state.config.split,
    instances: repeats[0]?.total ?? state.config.maxInstances,
  };
  return trial;
}

async function maybeReview(state: ExperimentState, cwd: string) {
  if (!shouldReview(state)) return;
  const review = await runMetaReview(state);
  review.actions = applyReviewActions(state, review, cwd);
  state.reviews.push(review);
}

function applyPendingReviews(state: ExperimentState, cwd: string) {
  const last = state.reviews.at(-1);
  if (last && !last.actions) {
    last.actions = applyReviewActions(state, last, cwd);
  }
}

function beat(state: ExperimentState, cwd: string, note: string) {
  saveWorkerStatus(
    {
      hostname: hostname(),
      startedAt: state.createdAt,
      updatedAt: new Date().toISOString(),
      mode: state.config.mode,
      note,
      pid: process.pid,
      lastTrialId: state.trials.at(-1)?.id,
    },
    cwd,
  );
}

function fmt(rate: number) {
  return `${(rate * 100).toFixed(2)}%`;
}

export function resetExperiment(cwd = process.cwd()) {
  const current = loadExperiment(cwd);
  const rebuilt = createExperiment(current.config);
  saveExperiment(rebuilt, cwd);
  return rebuilt;
}
