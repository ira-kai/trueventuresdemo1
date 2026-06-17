// Receives reply/bounce events from Instantly. Bounces + unsubscribes auto-feed
// the suppression list; replies route to the classifier. Phase 5.
import { NextRequest, NextResponse } from "next/server";
import { suppress } from "@/lib/suppression";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const email: string = body?.email ?? "";
  const event: string = body?.event ?? "";
  if (email && (event === "hard_bounce" || event === "unsubscribe")) {
    await suppress(email, event === "hard_bounce" ? "hard_bounce" : "unsubscribe", "via Instantly webhook");
  }
  // TODO(Phase 5): classify replies, alert on positives, draft booking reply.
  return NextResponse.json({ ok: true });
}
