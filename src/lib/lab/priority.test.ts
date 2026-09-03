import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createExperiment, saveCatalog, saveExperiment, prioritizeQueue } from "./store";
import { USER_PRIORITY_BATCH } from "./priority";
import { CATALOG } from "./catalog";

const cwd = mkdtempSync(path.join(tmpdir(), "dsh-priority-"));
try {
  const state = createExperiment({ mode: "dry" });
  state.queue = ["dsh-mneme", "dsh-evolve", ...USER_PRIORITY_BATCH.filter((id) => id !== "dsh-knowledge-graph")];
  state.championPluginIds = [];
  saveExperiment(state, cwd);
  saveCatalog(CATALOG, cwd);
  const next = prioritizeQueue(USER_PRIORITY_BATCH, cwd);
  assert.deepEqual(next.queue.slice(0, USER_PRIORITY_BATCH.length), [...USER_PRIORITY_BATCH]);
  assert.equal(next.queue.includes("dsh-mneme"), true);
  console.log("priority.test.ts passed", next.queue.slice(0, 10));
} finally {
  rmSync(cwd, { recursive: true, force: true });
}
