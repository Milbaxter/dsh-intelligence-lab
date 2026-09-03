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

export type PriorityPluginId = (typeof USER_PRIORITY_BATCH)[number];

export function isPriorityPlugin(id: string): boolean {
  return (USER_PRIORITY_BATCH as readonly string[]).includes(id);
}
