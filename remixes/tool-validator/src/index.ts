export const name = "dsh-tool-validator";
export const inject = ["tools"];

const DANGEROUS = /\brm\s+-rf\s+\/(?:\s|$)|:\(\)\s*\{\s*:\|:&\s*\};:/;

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "validate_tool_call",
    description:
      "Check a planned bash or editor call before running it. Call this when a previous tool failed or the command looks malformed.",
    parameters: {
      type: "object",
      properties: {
        tool: { type: "string", description: "bash | edit | other" },
        command: { type: "string", description: "The exact command or path about to run" },
        last_error: { type: "string" },
      },
      required: ["tool", "command"],
    },
    async execute(args: Record<string, string>) {
      const command = args.command ?? "";
      if (DANGEROUS.test(command)) {
        return {
          content: [
            {
              type: "text",
              text: "REJECTED: destructive command. Use a repo-scoped path and a single failing test.",
            },
          ],
        };
      }
      if (args.tool === "bash" && !/\b(pytest|python|django-admin|npm|git)\b/.test(command)) {
        return {
          content: [
            {
              type: "text",
              text: `WARN: ${command}\nPrefer a single failing test invocation over a broad shell tour.`,
            },
          ],
        };
      }
      if (args.last_error) {
        return {
          content: [
            {
              type: "text",
              text: `Previous error was: ${args.last_error}\nDo not rerun the same command. Change one argument, then retry.`,
            },
          ],
        };
      }
      return { content: [{ type: "text", text: `OK to run: ${command}` }] };
    },
  });
}
