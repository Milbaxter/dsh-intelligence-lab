import { NextResponse } from "next/server";
import { requestStop } from "@/lib/lab/lock";

export const dynamic = "force-dynamic";

export async function POST() {
  requestStop();
  return NextResponse.json({ ok: true });
}
