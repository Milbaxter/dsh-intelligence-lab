export const name = "remix-plan-before-edit";
export const inject = ["tools"];

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "localization_note",
    description:
      "Write a 5-line localization note before the first file edit: failing test, suspect file, suspect function, why, next command.",
    parameters: {
      type: "object",
      properties: {
        failing_test: { type: "string" },
        suspect_file: { type: "string" },
        suspect_symbol: { type: "string" },
        why: { type: "string" },
        next_command: { type: "string" },
      },
      required: ["failing_test", "suspect_file", "why"],
    },
    async execute(args: Record<string, string>) {
      const card = [
        `failing_test: ${args.failing_test}`,
        `suspect_file: ${args.suspect_file}`,
        `suspect_symbol: ${args.suspect_symbol ?? "unknown"}`,
        `why: ${args.why}`,
        `next_command: ${args.next_command ?? "run the failing test"}`,
      ].join("\n");
      return { content: [{ type: "text", text: card }] };
    },
  });
}
