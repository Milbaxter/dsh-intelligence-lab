export const name = "remix-verify-loop";
export const inject = ["tools"];

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "close_turn",
    description:
      "Call this only when a local test command is green. Remix of dsh-proof + dsh-doublecheck into one seam.",
    parameters: {
      type: "object",
      properties: {
        test_command: { type: "string" },
        exit_code: { type: "number" },
        patch_summary: { type: "string" },
      },
      required: ["test_command", "exit_code", "patch_summary"],
    },
    async execute(args: { test_command: string; exit_code: number; patch_summary: string }) {
      if (args.exit_code !== 0) {
        return {
          content: [
            {
              type: "text",
              text: `Turn is not closed. ${args.test_command} exited ${args.exit_code}. Keep going.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Verifier accepted. ${args.test_command} is green. Patch: ${args.patch_summary}`,
          },
        ],
      };
    },
  });
}
