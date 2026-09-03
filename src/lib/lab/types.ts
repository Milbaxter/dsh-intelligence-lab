export type PluginKind = "community" | "official" | "remix" | "idea";

export type PluginCategory =
  | "memory"
  | "planning"
  | "verification"
  | "context"
  | "skills"
  | "search"
  | "orchestration"
  | "failure"
  | "prompt"
  | "runtime"
  | "remix";

export interface PluginCandidate {
  id: string;
  name: string;
  repo: string;
  install: string;
  kind: PluginKind;
  category: PluginCategory;
  hypothesis: string;
  whyForSweBench: string;
  risk: "low" | "medium" | "high";
  /** Expected resolve-rate delta in percentage points, used only by the dry-run scorer. */
  priorBoostPp: number;
  /** Extra distraction / tool-bloat penalty for cheap models. */
  distractionPp: number;
  notes?: string;
  localPath?: string;
  /** Live SWE-bench skips these: they route work to a smart/paid model. */
  breaksCheapEval?: boolean;
}

export interface LabConfig {
  evalModel: string;
  metaModel: string;
  repeats: number;
  dataset: string;
  split: "lite50" | "lite100" | "lite" | "dev";
  maxInstances: number;
  profile: "headless" | "sdk-minimal" | "web";
  keepMarginPp: number;
  keepSeMultiplier: number;
  metaEvery: number;
  mode: "dry" | "live";
  apiKeyEnv: string;
  apiBaseUrl: string;
  autoCommit: boolean;
  workerHeartbeatPath: string;
}

export const ABLATE_PREFIX = "~ablate:";

export interface RepeatScore {
  seed: number;
  resolved: number;
  total: number;
  resolveRate: number;
  durationMs: number;
  predictionPath?: string;
  logPath?: string;
  simulated?: boolean;
}

export interface SetupScore {
  setupId: string;
  pluginIds: string[];
  repeats: RepeatScore[];
  meanResolveRate: number;
  stdResolveRate: number;
  seResolveRate: number;
  meanResolved: number;
}

export type Decision =
  | "baseline"
  | "keep"
  | "drop"
  | "skip"
  | "ablate-drop"
  | "ablate-keep";

export interface Trial {
  id: string;
  createdAt: string;
  candidateId: string;
  candidateName: string;
  championPluginIds: string[];
  testedPluginIds: string[];
  championScore: SetupScore;
  candidateScore: SetupScore;
  deltaPp: number;
  decision: Decision;
  reason: string;
  mode: "dry" | "live";
  model: string;
  split: string;
  instances: number;
}

export interface MetaReview {
  id: string;
  createdAt: string;
  afterTrialId: string;
  model: string;
  summary: string;
  findings: string[];
  suggestedRemixes: string[];
  suggestedDrops: string[];
  nextExperiments: string[];
  actions?: string[];
}

export interface Idea {
  id: string;
  createdAt: string;
  title: string;
  pitch: string;
  status: "inbox" | "queued" | "tested" | "kept" | "dropped";
}

export interface ExperimentState {
  version: 1;
  createdAt: string;
  updatedAt: string;
  config: LabConfig;
  status: "idle" | "running" | "paused" | "error";
  error?: string;
  queue: string[];
  championPluginIds: string[];
  championScore: SetupScore | null;
  trials: Trial[];
  reviews: MetaReview[];
  skipped: { id: string; reason: string }[];
  rngSeed: number;
}

export interface LiveReadiness {
  docker: boolean;
  apiKey: boolean;
  swebench: boolean;
  deepseekHarness: boolean;
  dsh: boolean;
  ready: boolean;
  missing: string[];
  note: string;
}

export interface LabSnapshot {
  experiment: ExperimentState;
  catalog: PluginCandidate[];
  ideas: Idea[];
  worker: WorkerStatus | null;
  readiness: LiveReadiness;
}

export interface WorkerStatus {
  hostname: string;
  startedAt: string;
  updatedAt: string;
  mode: "dry" | "live";
  note: string;
  pid?: number;
  lastTrialId?: string;
}
