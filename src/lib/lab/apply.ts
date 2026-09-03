import { loadCatalog } from "./store";
import { ABLATE_PREFIX, type ExperimentState, type MetaReview } from "./types";

export function applyReviewActions(
  state: ExperimentState,
  review: MetaReview,
  cwd = process.cwd(),
): string[] {
  const actions: string[] = [];
  const catalog = new Map(loadCatalog(cwd).map((plugin) => [plugin.id, plugin]));

  const preferred = review.nextExperiments.filter((id) => state.queue.includes(id));
  if (preferred.length > 0) {
    const rest = state.queue.filter((id) => !preferred.includes(id));
    state.queue = [...preferred, ...rest];
    actions.push(`Moved to front of queue: ${preferred.join(", ")}`);
  }

  for (const id of review.suggestedRemixes) {
    if (!catalog.has(id)) continue;
    if (state.championPluginIds.includes(id)) continue;
    if (state.queue.includes(id)) continue;
    if (state.trials.some((t) => t.candidateId === id)) continue;
    state.queue.unshift(id);
    actions.push(`Queued remix ${id}`);
  }

  const ablate = new Set<string>();
  for (const id of review.suggestedDrops) {
    if (state.championPluginIds.includes(id)) ablate.add(id);
  }
  if (state.championPluginIds.length >= 2) {
    ablate.add(state.championPluginIds[0]!);
  }
  for (const id of ablate) {
    const token = `${ABLATE_PREFIX}${id}`;
    const already =
      state.queue.includes(token) || state.trials.some((t) => t.candidateId === token);
    if (already) continue;
    state.queue.unshift(token);
    actions.push(`Queued ablation of ${id}`);
  }

  if (actions.length === 0) {
    actions.push("No queue changes.");
  }
  return actions;
}

export function isAblation(candidateId: string): boolean {
  return candidateId.startsWith(ABLATE_PREFIX);
}

export function ablationTarget(candidateId: string): string {
  return candidateId.slice(ABLATE_PREFIX.length);
}
