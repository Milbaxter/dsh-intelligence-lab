import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/lab/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(loadSnapshot());
}
