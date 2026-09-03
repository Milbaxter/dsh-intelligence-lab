import { liveReadiness } from "./readiness";
import { loadCatalog, loadExperiment, loadIdeas, loadWorkerStatus } from "./store";
import type { LabSnapshot } from "./types";

export function loadSnapshot(cwd = process.cwd()): LabSnapshot {
  return {
    experiment: loadExperiment(cwd),
    catalog: loadCatalog(cwd),
    ideas: loadIdeas(cwd),
    worker: loadWorkerStatus(cwd),
    readiness: liveReadiness(),
  };
}
