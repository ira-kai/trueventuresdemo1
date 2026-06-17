// On-demand sequence generation (chunked to stay within serverless limits;
// large lists should be processed in batches or a queue/cron). Phase 3 — wires
// the value matrix + Anthropic. Returns 501 until then.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, status: "not_implemented", phase: 3 },
    { status: 501 },
  );
}
