export const name = "remix-mneme-swe-notes";
export const inject = ["tools"];

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "swe_memory_write",
    description:
      "Store a SWE-bench transfer record: repo, failing test, root-cause file, patch hunk, outcome.",
    parameters: {
      type: "object",
      properties: {
        repo: { type: "string" },
        failing_test: { type: "string" },
        root_cause_file: { type: "string" },
        patch_hunk: { type: "string" },
        outcome: { type: "string", enum: ["resolved", "failed", "unknown"] },
      },
      required: ["repo", "failing_test", "outcome"],
    },
    async execute(args: Record<string, string>) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ schema: "swe-note-v1", ...args }, null, 2),
          },
        ],
      };
    },
  });
}
