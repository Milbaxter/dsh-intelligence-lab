import { spawnSync } from "node:child_process";
import type { LiveReadiness } from "./types";

let cached: { at: number; value: LiveReadiness } | null = null;

export function liveReadiness(): LiveReadiness {
  if (cached && Date.now() - cached.at < 15_000) return cached.value;
  const smoke = runSmoke();
  const missing = Object.entries({
    docker: smoke.docker,
    apiKey: smoke.api_key_present,
    swebench: smoke.swebench,
    deepseekHarness: smoke.deepseek_harness,
    dsh: smoke.dsh,
  })
    .filter(([, ok]) => !ok)
    .map(([name]) => name);

  const value: LiveReadiness = {
    docker: Boolean(smoke.docker),
    apiKey: Boolean(smoke.api_key_present),
    swebench: Boolean(smoke.swebench),
    deepseekHarness: Boolean(smoke.deepseek_harness),
    dsh: Boolean(smoke.dsh),
    ready: missing.length === 0,
    missing,
    note: String(smoke.note ?? ""),
  };
  cached = { at: Date.now(), value };
  return value;
}

function runSmoke(): Record<string, boolean | string> {
  const result = spawnSync("python3", ["lab/swebench_adapter.py", "--smoke"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (result.status !== 0 || !result.stdout) {
    return {
      docker: false,
      api_key_present: Boolean(process.env.DEEPSEEK_API_KEY),
      swebench: false,
      deepseek_harness: false,
      dsh: false,
      note: result.stderr || "Could not run lab/swebench_adapter.py --smoke.",
    };
  }
  try {
    return JSON.parse(result.stdout) as Record<string, boolean | string>;
  } catch {
    return {
      docker: false,
      api_key_present: Boolean(process.env.DEEPSEEK_API_KEY),
      swebench: false,
      deepseek_harness: false,
      dsh: false,
      note: "Smoke output was not JSON.",
    };
  }
}
