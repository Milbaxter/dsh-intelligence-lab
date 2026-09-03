import { catalogById } from "./catalog";
import type { ExperimentState, MetaReview, PluginCandidate, Trial } from "./types";

export function shouldReview(state: ExperimentState): boolean {
  const decided = state.trials.filter((t) => t.decision === "keep" || t.decision === "drop");
  if (decided.length === 0) return false;
  if (decided.length % state.config.metaEvery !== 0) return false;
  const last = state.reviews.at(-1);
  if (!last) return true;
  return last.afterTrialId !== decided.at(-1)?.id;
}

export async function runMetaReview(state: ExperimentState): Promise<MetaReview> {
  const decided = state.trials.filter((t) => t.decision === "keep" || t.decision === "drop");
  const last = decided.at(-1);
  if (!last) {
    throw new Error("No trials to review");
  }

  if (state.config.mode === "live" && process.env[state.config.apiKeyEnv]) {
    try {
      return await reviewWithModel(state, last);
    } catch {
      // Fall through to the local reviewer so a missing smart model never stalls the loop.
    }
  }

  return reviewLocally(state, last);
}

function reviewLocally(state: ExperimentState, last: Trial): MetaReview {
  const catalog = catalogById();
  const kept = state.trials.filter((t) => t.decision === "keep");
  const dropped = state.trials.filter((t) => t.decision === "drop");
  const keptCats = countCats(kept, catalog);
  const droppedCats = countCats(dropped, catalog);

  const findings: string[] = [];
  if (kept.length === 0) {
    findings.push(
      "Nothing has beaten the default DeepSeek Harness plugin set yet. Prefer smaller verification remixes over memory stacks.",
    );
  } else {
    findings.push(
      `Champion stack is default plugins + ${state.championPluginIds.join(", ") || "(none)"}.`,
    );
    findings.push(
      `Keeps clustered around ${topKey(keptCats) ?? "mixed"} plugins; drops clustered around ${topKey(droppedCats) ?? "mixed"}.`,
    );
  }

  const lastDelta = last.deltaPp * 100;
  findings.push(
    `Latest trial ${last.candidateName} was ${last.decision} (${lastDelta >= 0 ? "+" : ""}${lastDelta.toFixed(2)} pp).`,
  );

  if ((droppedCats.orchestration ?? 0) >= 2) {
    findings.push(
      "Two or more orchestration plugins already failed. Stop stacking directors and workflows until a test gate is kept.",
    );
  }
  if ((keptCats.verification ?? 0) >= 1 && (keptCats.memory ?? 0) === 0) {
    findings.push(
      "A verification plugin is earning its keep. Memory is more likely to help now that the agent has a place to store failing tests.",
    );
  }

  const suggestedRemixes = [
    "remix-verify-loop",
    "remix-smallest-patch",
    "remix-failure-notebook",
  ].filter((id) => catalog.has(id));

  const suggestedDrops = state.championPluginIds.filter((id) => {
    const plugin = catalog.get(id);
    return plugin?.category === "orchestration" || plugin?.risk === "high";
  });

  const nextExperiments = suggestNext(state, catalog);

  return {
    id: `review-${state.reviews.length + 1}`,
    createdAt: new Date().toISOString(),
    afterTrialId: last.id,
    model: `${state.config.metaModel} (local heuristic fallback)`,
    summary:
      kept.length === 0
        ? "Default DSH plugins are still the champion. The next wins are likely small test-discipline remixes, not more tools."
        : `Greedy search is compounding ${kept.length} keep(s). Protect the champion, test one additive plugin at a time, and remix rather than stacking two memory systems.`,
    findings,
    suggestedRemixes,
    suggestedDrops,
    nextExperiments,
  };
}

async function reviewWithModel(state: ExperimentState, last: Trial): Promise<MetaReview> {
  const local = reviewLocally(state, last);
  const endpoint =
    state.config.apiBaseUrl || "https://api.deepseek.com/v1/chat/completions";
  const key = process.env[state.config.apiKeyEnv];
  if (!key) return local;

  const body = {
    model: state.config.metaModel,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You review DeepSeek Harness plugin search results on SWE-bench Lite. Return concise JSON with keys summary, findings, suggestedRemixes, suggestedDrops, nextExperiments. No markdown.",
      },
      {
        role: "user",
        content: JSON.stringify({
          champion: state.championPluginIds,
          championScore: state.championScore,
          recentTrials: state.trials.slice(-12),
          heuristic: local,
        }),
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return local;
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content;
  if (!text) return local;
  try {
    const parsed = JSON.parse(text) as Partial<MetaReview>;
    return {
      ...local,
      model: state.config.metaModel,
      summary: parsed.summary ?? local.summary,
      findings: parsed.findings ?? local.findings,
      suggestedRemixes: parsed.suggestedRemixes ?? local.suggestedRemixes,
      suggestedDrops: parsed.suggestedDrops ?? local.suggestedDrops,
      nextExperiments: parsed.nextExperiments ?? local.nextExperiments,
    };
  } catch {
    return { ...local, model: state.config.metaModel, summary: text.slice(0, 800) };
  }
}

function countCats(trials: Trial[], catalog: Map<string, PluginCandidate>) {
  const counts: Record<string, number> = {};
  for (const trial of trials) {
    const cat = catalog.get(trial.candidateId)?.category ?? "unknown";
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return counts;
}

function topKey(counts: Record<string, number>): string | undefined {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function suggestNext(state: ExperimentState, catalog: Map<string, PluginCandidate>) {
  const remaining = state.queue
    .map((id) => catalog.get(id))
    .filter((p): p is PluginCandidate => Boolean(p));
  const preferred = remaining
    .filter((p) => p.kind === "remix" || p.category === "verification" || p.category === "planning")
    .slice(0, 3)
    .map((p) => p.id);
  return preferred.length > 0 ? preferred : remaining.slice(0, 3).map((p) => p.id);
}
