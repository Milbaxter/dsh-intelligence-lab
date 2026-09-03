import assert from "node:assert/strict";
import { assertCheapEvalModel, DEFAULT_EVAL_MODEL } from "./models";

assert.equal(assertCheapEvalModel("deepseek-v4-flash"), "deepseek-v4-flash");
assert.equal(assertCheapEvalModel("DEEPSEEK-CHAT"), "deepseek-chat");
assert.equal(DEFAULT_EVAL_MODEL, "deepseek-v4-flash");

let threw = false;
try {
  assertCheapEvalModel("deepseek-v4-pro");
} catch {
  threw = true;
}
assert.equal(threw, true, "pro must be rejected for eval");

threw = false;
try {
  assertCheapEvalModel("claude-4-opus");
} catch {
  threw = true;
}
assert.equal(threw, true);
console.log("models.test.ts passed");
