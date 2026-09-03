/** Models allowed to *score* SWE-bench. Smart models are for meta-review only. */
export const CHEAP_EVAL_MODELS = [
  "deepseek-v4-flash",
  "deepseek-chat",
] as const;

export type CheapEvalModel = (typeof CHEAP_EVAL_MODELS)[number];

export const DEFAULT_EVAL_MODEL: CheapEvalModel = "deepseek-v4-flash";

const SMART_HINTS = [
  "pro",
  "opus",
  "gpt-4",
  "gpt-5",
  "claude-3",
  "claude-4",
  "o1",
  "o3",
  "gemini-2.5-pro",
  "reasoner",
];

export function assertCheapEvalModel(model: string): CheapEvalModel {
  const normalized = model.trim().toLowerCase();
  if ((CHEAP_EVAL_MODELS as readonly string[]).includes(normalized)) {
    return normalized as CheapEvalModel;
  }
  if (SMART_HINTS.some((hint) => normalized.includes(hint))) {
    throw new Error(
      `Eval model "${model}" is too smart/expensive. Benchmarks must use a cheap model (${CHEAP_EVAL_MODELS.join(", ")}). Put the smart model in metaModel instead.`,
    );
  }
  throw new Error(
    `Unknown eval model "${model}". Allowed cheap models: ${CHEAP_EVAL_MODELS.join(", ")}.`,
  );
}
