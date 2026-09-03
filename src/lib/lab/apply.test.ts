import assert from "node:assert/strict";
import { applyReviewActions } from "./apply";
import { createExperiment } from "./store";
import type { MetaReview } from "./types";

const state = createExperiment();
state.championPluginIds = ["dsh-doublecheck", "dsh-proof"];
state.queue = ["dsh-mneme", "remix-smallest-patch", "dsh-evolve"];

const review: MetaReview = {
  id: "review-test",
  createdAt: new Date().toISOString(),
  afterTrialId: "x",
  model: "test",
  summary: "test",
  findings: [],
  suggestedRemixes: ["remix-verify-loop", "remix-smallest-patch"],
  suggestedDrops: [],
  nextExperiments: ["remix-smallest-patch"],
};

const actions = applyReviewActions(state, review);
assert.ok(actions.some((a) => a.includes("ablation of dsh-doublecheck")));
assert.ok(actions.some((a) => a.includes("remix-verify-loop")));
assert.equal(state.queue[0], "~ablate:dsh-doublecheck");
assert.ok(state.queue.includes("remix-verify-loop"));
assert.ok(state.queue.indexOf("remix-smallest-patch") < state.queue.indexOf("dsh-mneme"));
console.log("apply.test.ts passed", { actions, queueHead: state.queue.slice(0, 4) });
