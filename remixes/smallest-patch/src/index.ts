export const name = "remix-smallest-patch";
export const inject = ["tools"];

const PRIOR = `Lite gold patches edit one file and at most three hunks.
If your working tree touches more than that, delete the extra hunks.
Do not rename symbols for style. Do not add comments unless the test reads them.`;

export function apply(ctx: { tools: { register: (tool: Record<string, unknown>) => void } }) {
  ctx.tools.register({
    name: "patch_budget",
    description: "Report how many files and hunks the current diff uses.",
    parameters: {
      type: "object",
      properties: {
        files_changed: { type: "number" },
        hunks: { type: "number" },
      },
      required: ["files_changed", "hunks"],
    },
    async execute(args: { files_changed: number; hunks: number }) {
      const ok = args.files_changed <= 1 && args.hunks <= 3;
      return {
        content: [
          {
            type: "text",
            text: `${PRIOR}\n\nCurrent diff: ${args.files_changed} file(s), ${args.hunks} hunk(s). ${ok ? "Within Lite shape." : "Too large — shrink it."}`,
          },
        ],
      };
    },
  });
}
