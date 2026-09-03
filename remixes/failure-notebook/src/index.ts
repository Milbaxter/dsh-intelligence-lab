export const name = "remix-failure-notebook";
export const inject = ["tools"];

const notes: string[] = [];

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "note_failure",
    description: "Append a failed command or hypothesis so you do not retry it blindly.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string" },
        error: { type: "string" },
        do_not_retry: { type: "boolean" },
      },
      required: ["command", "error"],
    },
    async execute(args: { command: string; error: string; do_not_retry?: boolean }) {
      const line = `- ${args.command} :: ${args.error}${args.do_not_retry ? " (do not retry)" : ""}`;
      notes.push(line);
      return { content: [{ type: "text", text: `FAILURES.md\n${notes.join("\n")}` }] };
    },
  });
}
