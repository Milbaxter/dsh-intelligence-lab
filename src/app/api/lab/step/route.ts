import { spawn } from "node:child_process";
import { NextResponse } from "next/server";
import { runSteps } from "@/lib/lab/loop";
import { loadExperiment, saveExperiment } from "@/lib/lab/store";
import { readLock } from "@/lib/lab/lock";
import type { LabConfig } from "@/lib/lab/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    steps?: number;
    mode?: LabConfig["mode"];
    detach?: boolean;
  };
  const current = loadExperiment();
  if (body.mode) current.config.mode = body.mode;
  saveExperiment(current);

  const steps = Math.max(1, body.steps ?? 1);
  const detach = Boolean(body.detach) || current.config.mode === "live" || steps > 1;

  if (detach) {
    const existing = readLock();
    if (existing) {
      return NextResponse.json(
        { error: `A worker is already running (pid ${existing.pid}).`, status: current.status },
        { status: 409 },
      );
    }
    const child = spawn("npx", ["tsx", "lab/cli.ts", "daemon", "--steps", String(steps)], {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    return NextResponse.json({
      detached: true,
      pid: child.pid,
      steps,
      mode: current.config.mode,
    });
  }

  const state = await runSteps(steps);
  return NextResponse.json({ detached: false, state });
}
