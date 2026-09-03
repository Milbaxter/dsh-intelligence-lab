import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createExperiment, saveCatalog, saveExperiment } from "./store";
import { runSteps } from "./loop";
import { CATALOG } from "./catalog";
import type { PluginCandidate } from "./types";

async function main() {
  const cwd = mkdtempSync(path.join(tmpdir(), "dsh-lab-"));
  try {
    const state = createExperiment({ mode: "dry", repeats: 3, split: "lite50", metaEvery: 6 });
    state.queue = [
      "idea-should-skip",
      ...CATALOG.slice(0, 8).map((p) => p.id),
    ];
    saveExperiment(state, cwd);
    saveCatalog(
      [
        ...CATALOG,
        {
          id: "idea-should-skip",
          name: "Fake idea",
          repo: "local:ideas",
          install: "idea:idea-should-skip",
          kind: "idea",
          category: "remix",
          hypothesis: "A pitch is not a plugin.",
          whyForSweBench: "Should never keep in dry-run.",
          risk: "low",
          priorBoostPp: 9,
          distractionPp: 0,
        } satisfies PluginCandidate,
      ],
      cwd,
    );

    const after = await runSteps(12, cwd);
    assert.ok(after.championScore, "baseline must exist");
    assert.equal(after.trials[0]?.decision, "baseline");
    assert.ok(after.reviews.length >= 1, "meta review every 6 decided trials");
    assert.ok(after.reviews[0]?.actions?.length, "review must apply queue actions");
    const ablations = after.trials.filter((t) => t.decision.startsWith("ablate-"));
    assert.ok(ablations.length >= 1, "champion should be ablated after the first review");
    assert.ok(
      after.skipped.some((s) => s.id === "idea-should-skip"),
      "dry-run must skip ideas",
    );
    for (const trial of after.trials) {
      assert.match(trial.reason, /Simulated/);
    }
    console.log("loop.test.ts passed", {
      champion: after.championPluginIds,
      score: after.championScore?.meanResolveRate,
      reviews: after.reviews[0]?.actions,
      ablations: ablations.map((t) => t.decision),
      skipped: after.skipped,
    });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

void main();
