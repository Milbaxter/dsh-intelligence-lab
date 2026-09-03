import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { CATALOG, defaultQueue } from "./catalog";
import { USER_PRIORITY_BATCH } from "./priority";
import { DEFAULT_CONFIG } from "./defaults";
import { pidAlive, readLock } from "./lock";
import {
  catalogPath,
  experimentPath,
  ideasPath,
  runsDir,
  splitsDir,
  workerStatusPath,
} from "./paths";
import type {
  ExperimentState,
  Idea,
  LabConfig,
  PluginCandidate,
  WorkerStatus,
} from "./types";

export function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

export function writeJson(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function ensureLabFiles(cwd = process.cwd()) {
  mkdirSync(splitsDir(cwd), { recursive: true });
  mkdirSync(runsDir(cwd), { recursive: true });
  if (!existsSync(catalogPath(cwd))) {
    writeJson(catalogPath(cwd), CATALOG);
  }
  if (!existsSync(ideasPath(cwd))) {
    writeJson(ideasPath(cwd), seedIdeas());
  }
  if (!existsSync(experimentPath(cwd))) {
    writeJson(experimentPath(cwd), createExperiment());
  }
}

export function createExperiment(overrides: Partial<LabConfig> = {}): ExperimentState {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    config: { ...DEFAULT_CONFIG, ...overrides },
    status: "idle",
    queue: defaultQueue(),
    championPluginIds: [],
    championScore: null,
    trials: [],
    reviews: [],
    skipped: [],
    rngSeed: 20260903,
  };
}

export function loadExperiment(cwd = process.cwd()): ExperimentState {
  ensureLabFiles(cwd);
  const state = readJson(experimentPath(cwd), createExperiment());
  if (state.status === "running") {
    const lock = readLock(cwd);
    if (!lock || !pidAlive(lock.pid)) {
      state.status = "idle";
      state.error = "Recovered from a dead worker. The last in-flight step was not saved.";
      writeJson(experimentPath(cwd), state);
    }
  }
  return state;
}

export function saveExperiment(state: ExperimentState, cwd = process.cwd()) {
  state.updatedAt = new Date().toISOString();
  writeJson(experimentPath(cwd), state);
}

export function loadCatalog(cwd = process.cwd()): PluginCandidate[] {
  ensureLabFiles(cwd);
  const disk = readJson<PluginCandidate[]>(catalogPath(cwd), CATALOG);
  const byId = new Map(disk.map((p) => [p.id, p]));
  for (const plugin of CATALOG) {
    if (!byId.has(plugin.id)) {
      disk.push(plugin);
      byId.set(plugin.id, plugin);
    }
  }
  writeJson(catalogPath(cwd), disk);
  return disk;
}

export function saveCatalog(catalog: PluginCandidate[], cwd = process.cwd()) {
  writeJson(catalogPath(cwd), catalog);
}

export function prioritizeQueue(ids: readonly string[] = USER_PRIORITY_BATCH, cwd = process.cwd()) {
  const state = loadExperiment(cwd);
  const known = new Set(loadCatalog(cwd).map((plugin) => plugin.id));
  const incoming = ids.filter((id) => known.has(id) && !state.championPluginIds.includes(id));
  const rest = state.queue.filter((id) => !incoming.includes(id));
  state.queue = [...incoming, ...rest];
  saveExperiment(state, cwd);
  return state;
}

export function loadIdeas(cwd = process.cwd()): Idea[] {
  ensureLabFiles(cwd);
  return readJson<Idea[]>(ideasPath(cwd), []);
}

export function saveIdeas(ideas: Idea[], cwd = process.cwd()) {
  writeJson(ideasPath(cwd), ideas);
}

export function loadWorkerStatus(cwd = process.cwd()): WorkerStatus | null {
  return readJson<WorkerStatus | null>(workerStatusPath(cwd), null);
}

export function saveWorkerStatus(status: WorkerStatus, cwd = process.cwd()) {
  writeJson(workerStatusPath(cwd), status);
}

function seedIdeas(): Idea[] {
  const now = new Date().toISOString();
  return [
    {
      id: "idea-hidden-test-shadow",
      createdAt: now,
      title: "Hidden-test shadow runner",
      pitch:
        "A plugin that treats the issue body's implied tests as a contract and refuses to finish until a local shadow suite is green. Not the official hidden tests — a reconstructed public proxy.",
      status: "inbox",
    },
    {
      id: "idea-repo-map-card",
      createdAt: now,
      title: "One-page repo map",
      pitch:
        "On session start, write a 30-line map: package layout, test runner, how to run one test. Inject it every turn. Cheap models waste the first 10 calls discovering pytest vs django.",
      status: "inbox",
    },
    {
      id: "idea-patch-diff-budget",
      createdAt: now,
      title: "Patch diff budget",
      pitch:
        "Hard-cap the working tree diff at 120 lines. If exceeded, the plugin rewinds the extra hunks and asks for a smaller fix. Lite gold patches are tiny.",
      status: "inbox",
    },
  ];
}
