export const name = "remix-test-first-gate";
export const inject = ["tools"];

const CHECKLIST = `SWE-bench working rules:
1. Find the failing test from the issue. Run it before editing anything.
2. Make the smallest patch that turns that test green.
3. Re-run the same test. If it is still red, do not claim you are done.
4. Do not refactor unrelated files.`;

export function apply(ctx: {
  tools: { register: (tool: Record<string, unknown>) => void };
  effect?: (fn: () => void | (() => void)) => void;
}) {
  ctx.tools.register({
    name: "swe_repro_status",
    description:
      "Record whether the reproducing test has been run, and whether it is currently red or green.",
    parameters: {
      type: "object",
      properties: {
        test_command: { type: "string" },
        result: { type: "string", enum: ["red", "green", "not_run"] },
        notes: { type: "string" },
      },
      required: ["test_command", "result"],
    },
    async execute(args: { test_command: string; result: string; notes?: string }) {
      return {
        content: [
          {
            type: "text",
            text: `${CHECKLIST}\n\nRecorded ${args.test_command} as ${args.result}. ${args.notes ?? ""}`.trim(),
          },
        ],
      };
    },
  });
}
