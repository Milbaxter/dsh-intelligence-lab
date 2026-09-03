import type { LabConfig } from "./types";
import { DEFAULT_EVAL_MODEL } from "./models";

export const DEFAULT_CONFIG: LabConfig = {
  evalModel: DEFAULT_EVAL_MODEL,
  metaModel: "deepseek-v4-pro",
  repeats: 3,
  dataset: "princeton-nlp/SWE-bench_Lite",
  split: "lite50",
  maxInstances: 50,
  profile: "headless",
  keepMarginPp: 0.5,
  keepSeMultiplier: 0.75,
  metaEvery: 6,
  mode: "dry",
  apiKeyEnv: "DEEPSEEK_API_KEY",
  apiBaseUrl: "",
  autoCommit: false,
  workerHeartbeatPath: "data/worker-status.json",
};

export const SPLIT_SIZES: Record<LabConfig["split"], number> = {
  lite50: 50,
  lite100: 100,
  lite: 300,
  dev: 23,
};

export const BASELINE_PLUGIN_IDS: string[] = [];
