import { NextResponse } from "next/server";
import { assertCheapEvalModel } from "@/lib/lab/models";
import { loadExperiment, saveExperiment } from "@/lib/lab/store";
import type { LabConfig } from "@/lib/lab/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const patch = (await request.json()) as Partial<LabConfig>;
  const state = loadExperiment();
  const next = { ...state.config, ...patch };
  try {
    next.evalModel = assertCheapEvalModel(next.evalModel);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid eval model" },
      { status: 400 },
    );
  }
  state.config = next;
  saveExperiment(state);
  return NextResponse.json(state.config);
}
