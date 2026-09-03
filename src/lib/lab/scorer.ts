import { spawn } from "node:child_process";
import path from "node:path";
import { SPLIT_SIZES } from "./defaults";
import { assertCheapEvalModel } from "./models";
import { loadCatalog } from "./store";
import { clamp, hashSeed, mulberry32 } from "./stats";
import type { LabConfig, PluginCandidate, RepeatScore } from "./types";

export interface ScoreRequest {
  setupId: string;
  pluginIds: string[];
  seed: number;
  config: LabConfig;
  cwd?: string;
}

const BASE_RATE = 0.168;

export async function scoreSetup(req: ScoreRequest): Promise<RepeatScore> {
  if (req.config.mode === "live") {
    return scoreLive(req);
  }
  return scoreDry(req);
}

function scoreDry(req: ScoreRequest): RepeatScore {
  const catalog = new Map(loadCatalog(req.cwd).map((plugin) => [plugin.id, plugin]));
  const instances = SPLIT_SIZES[req.config.split] ?? req.config.maxInstances;
  const boost = req.pluginIds.reduce((sum, id) => {
    const plugin = catalog.get(id);
    if (!plugin) return sum;
    return sum + plugin.priorBoostPp - plugin.distractionPp * interactionTax(req.pluginIds, plugin, catalog);
  }, 0);

  const rng = mulberry32(hashSeed(`${req.setupId}:${req.seed}:${req.config.evalModel}`));
  const noisePp = (rng() - 0.5) * 3.2;
  const rate = clamp(BASE_RATE + (boost + noisePp) / 100, 0.02, 0.55);
  const resolved = Math.round(rate * instances);
  const exact = resolved / instances;

  return {
    seed: req.seed,
    resolved,
    total: instances,
    resolveRate: exact,
    durationMs: 40 + Math.round(rng() * 80),
    simulated: true,
  };
}

function interactionTax(
  pluginIds: string[],
  plugin: PluginCandidate,
  catalog: Map<string, PluginCandidate>,
): number {
  const heavy = pluginIds.filter((id) => {
    const p = catalog.get(id);
    return p && (p.category === "orchestration" || p.category === "memory");
  }).length;
  if (plugin.category === "orchestration" || plugin.category === "memory") {
    return 1 + heavy * 0.15;
  }
  return 1;
}

async function scoreLive(req: ScoreRequest): Promise<RepeatScore> {
  const model = assertCheapEvalModel(req.config.evalModel);
  const script = path.join(process.cwd(), "lab", "swebench_adapter.py");
  const payload = JSON.stringify({
    setup_id: req.setupId,
    plugin_ids: req.pluginIds,
    seed: req.seed,
    model,
    dataset: req.config.dataset,
    split: req.config.split,
    max_instances: req.config.maxInstances,
    profile: req.config.profile,
    api_key_env: req.config.apiKeyEnv,
    api_base_url: req.config.apiBaseUrl,
  });

  const stdout = await runProcess("python3", [script, "--score", payload], {
    DEEPSEEK_API_KEY: process.env[req.config.apiKeyEnv] ?? "",
    DSH_MODEL: model,
  });

  const parsed = JSON.parse(stdout) as RepeatScore;
  if (typeof parsed.resolveRate !== "number") {
    throw new Error(`Live scorer returned an invalid payload: ${stdout.slice(0, 400)}`);
  }
  return parsed;
}

function runProcess(
  command: string,
  args: string[],
  extraEnv: NodeJS.ProcessEnv = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: { ...process.env, ...extraEnv },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Process exited ${code}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}
