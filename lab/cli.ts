#!/usr/bin/env npx tsx
import { createExperiment, ensureLabFiles, loadExperiment, prioritizeQueue, saveExperiment } from "../src/lib/lab/store";
import { loadSnapshot } from "../src/lib/lab/snapshot";
import { resetExperiment, runDaemon, runSteps } from "../src/lib/lab/loop";
import { requestStop } from "../src/lib/lab/lock";
import { DEFAULT_CONFIG } from "../src/lib/lab/defaults";
import { assertCheapEvalModel } from "../src/lib/lab/models";
import { batchForWave } from "../src/lib/lab/priority";
import type { LabConfig } from "../src/lib/lab/types";

function args() {
  const argv = process.argv.slice(2);
  const command = argv[0] ?? "status";
  const flags: Record<string, string | boolean> = {};
  for (let i = 1; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return { command, flags };
}

async function main() {
  const { command, flags } = args();
  ensureLabFiles();

  if (command === "init") {
    const state = createExperiment(flagConfig(flags));
    saveExperiment(state);
    console.log(`Initialized experiment. Queue length ${state.queue.length}. Mode ${state.config.mode}.`);
    return;
  }

  if (command === "reset") {
    const state = resetExperiment();
    console.log(`Reset. Queue length ${state.queue.length}.`);
    return;
  }

  if (command === "stop") {
    requestStop();
    console.log("Stop requested. The daemon will halt after the current step.");
    return;
  }

  if (command === "status") {
    const snap = loadSnapshot();
    const exp = snap.experiment;
    console.log(
      JSON.stringify(
        {
          status: exp.status,
          mode: exp.config.mode,
          model: exp.config.evalModel,
          champion: exp.championPluginIds,
          score: exp.championScore?.meanResolveRate ?? null,
          trials: exp.trials.length,
          queue: exp.queue.length,
          reviews: exp.reviews.length,
          worker: snap.worker,
          readiness: snap.readiness,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (command === "prioritize") {
    const wave = typeof flags.wave === "string" ? flags.wave : undefined;
    const ids =
      typeof flags.ids === "string"
        ? flags.ids.split(",").map((id) => id.trim())
        : batchForWave(wave);
    const state = prioritizeQueue(ids);
    console.log(
      JSON.stringify(
        {
          message: `Moved ${ids.length} plugins to the front of the queue.`,
          queueHead: state.queue.slice(0, ids.length),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (command === "worker") {
    console.log(`This process cannot register a Cursor worker (no account login here).
On the Linux/macOS box that will run SWE-bench:

  chmod +x scripts/start-cursor-worker.sh scripts/bootstrap-lab-machine.sh
  ./scripts/start-cursor-worker.sh

Keep that process alive. Then in another shell on the same machine:

  export DEEPSEEK_API_KEY=sk-...
  ./scripts/bootstrap-lab-machine.sh

Eval model is pinned to deepseek-v4-flash (cheap/fast). Meta-review may use a smarter model.
`);
    return;
  }

  if (command !== "run" && command !== "daemon") {
    console.error(`Unknown command ${command}. Use init | run | daemon | stop | status | reset | worker | prioritize`);
    process.exit(1);
  }

  const current = loadExperiment();
  if (flags.mode === "dry" || flags.mode === "live") {
    current.config.mode = flags.mode;
  }
  current.config.evalModel = assertCheapEvalModel(
    typeof flags.model === "string" ? flags.model : current.config.evalModel,
  );
  if (typeof flags.split === "string") {
    current.config.split = flags.split as LabConfig["split"];
  }
  if (typeof flags.repeats === "string") current.config.repeats = Number(flags.repeats);
  if (flags["auto-commit"] === true) current.config.autoCommit = true;
  saveExperiment(current);
  const steps =
    command === "daemon"
      ? Number(flags.steps ?? 200)
      : Number(flags.steps ?? 1);
  const state = command === "daemon" ? await runDaemon(steps) : await runSteps(steps);
  const last = state.trials.at(-1);
  console.log(
    JSON.stringify(
      {
        message: last
          ? `${last.decision} ${last.candidateName} (${(last.deltaPp * 100).toFixed(2)} pp)`
          : "No trial",
        champion: state.championPluginIds,
        score: state.championScore?.meanResolveRate ?? null,
        trials: state.trials.length,
        queue: state.queue.length,
        status: state.status,
      },
      null,
      2,
    ),
  );
}

function flagConfig(flags: Record<string, string | boolean>): Partial<LabConfig> {
  const next: Partial<LabConfig> = { ...DEFAULT_CONFIG };
  if (flags.mode === "dry" || flags.mode === "live") next.mode = flags.mode;
  if (typeof flags.model === "string") next.evalModel = assertCheapEvalModel(flags.model);
  return next;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
