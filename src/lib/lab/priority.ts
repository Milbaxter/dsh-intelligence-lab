/** User-requested first wave. Order is the test order. */
export const USER_PRIORITY_BATCH = [
  "dsh-mcp-bridge",
  "dsh-context-compactor",
  "dsh-workspace-rag",
  "dsh-plan-and-solve",
  "dsh-tool-validator",
  "dsh-multi-agent-debate",
  "dsh-subagent-claude",
  "dsh-deep-research",
  "dsh-model-router",
  "dsh-knowledge-graph",
] as const;

/** Intelligence picks from vvlife/awesome-deepseek-harness-plugins. Skins/pets omitted. */
export const INTEL_WAVE = [
  "superpowers-dsh",
  "dsh-plugin-verify",
  "dsh-lsp-actions",
  "dsh-light-memory",
  "dsh-tool-turbo",
  "dsh-undo",
  "dsh-compaction-instant",
  "dsh-context-taxonomy",
] as const;

export type PriorityPluginId = (typeof USER_PRIORITY_BATCH)[number];

export function isPriorityPlugin(id: string): boolean {
  return (
    (USER_PRIORITY_BATCH as readonly string[]).includes(id) ||
    (INTEL_WAVE as readonly string[]).includes(id)
  );
}

export function batchForWave(wave?: string): readonly string[] {
  if (wave === "intel" || wave === "awesome") return INTEL_WAVE;
  return USER_PRIORITY_BATCH;
}
