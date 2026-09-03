export const name = "remix-compact-then-act";
export const inject = ["tools"];

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "state_card",
    description: "After several tool calls, replace raw logs with a 10-line state card.",
    parameters: {
      type: "object",
      properties: {
        failing_test: { type: "string" },
        files: { type: "string" },
        last_error: { type: "string" },
        next_action: { type: "string" },
      },
      required: ["failing_test", "next_action"],
    },
    async execute(args: Record<string, string>) {
      const card = [
        `failing_test: ${args.failing_test}`,
        `files: ${args.files ?? ""}`,
        `last_error: ${args.last_error ?? ""}`,
        `next_action: ${args.next_action}`,
      ].join("\n");
      return { content: [{ type: "text", text: card }] };
    },
  });
}
