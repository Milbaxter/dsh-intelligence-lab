export const name = "dsh-multi-agent-debate";
export const inject = ["tools"];

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "debate_fix",
    description:
      "Write two competing localizations and pick one before editing. Both sides run on the same cheap eval model — no second provider.",
    parameters: {
      type: "object",
      properties: {
        failing_test: { type: "string" },
        approach_a: { type: "string", description: "File + symbol + why this is the bug" },
        approach_b: { type: "string", description: "The strongest alternative" },
        winner: { type: "string", description: "a or b" },
        why: { type: "string" },
      },
      required: ["failing_test", "approach_a", "approach_b", "winner", "why"],
    },
    async execute(args: Record<string, string>) {
      const card = [
        `failing_test: ${args.failing_test}`,
        `A: ${args.approach_a}`,
        `B: ${args.approach_b}`,
        `winner: ${args.winner}`,
        `why: ${args.why}`,
      ].join("\n");
      return { content: [{ type: "text", text: card }] };
    },
  });
}
