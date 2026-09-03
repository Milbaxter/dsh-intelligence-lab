import { NextResponse } from "next/server";
import { resetExperiment } from "@/lib/lab/loop";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(resetExperiment());
}
