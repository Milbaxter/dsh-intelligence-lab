import assert from "node:assert/strict";
import { decideKeep, summarizeSetup } from "./decision";
import { DEFAULT_CONFIG } from "./defaults";
import type { RepeatScore } from "./types";

function repeats(rates: number[]): RepeatScore[] {
  return rates.map((resolveRate, seed) => ({
    seed,
    resolved: Math.round(resolveRate * 50),
    total: 50,
    resolveRate,
    durationMs: 1,
  }));
}

const champ = summarizeSetup("base", [], repeats([0.16, 0.18, 0.17]));

{
  const cand = summarizeSetup("better", ["dsh-proof"], repeats([0.22, 0.24, 0.23]));
  const decision = decideKeep(champ, cand, DEFAULT_CONFIG);
  assert.equal(decision.keep, true, "clear lift should keep");
}

{
  const cand = summarizeSetup("noise", ["modsearch"], repeats([0.17, 0.16, 0.18]));
  const decision = decideKeep(champ, cand, DEFAULT_CONFIG);
  assert.equal(decision.keep, false, "noise around baseline should drop");
}

{
  const cand = summarizeSetup("worse", ["dsh-evolve"], repeats([0.10, 0.11, 0.09]));
  const decision = decideKeep(champ, cand, DEFAULT_CONFIG);
  assert.equal(decision.keep, false);
  assert.ok(decision.deltaPp < 0);
}

console.log("decision.test.ts passed");
