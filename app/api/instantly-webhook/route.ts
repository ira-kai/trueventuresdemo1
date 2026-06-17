// Receives reply/bounce/unsubscribe events from Instantly.
//  - reply: record event + classify; if positive, record a positive (-> alert).
//  - bounce / unsubscribe: record event + add to suppression list.
// Never auto-sends; positives are surfaced for a human to act on.
import { NextRequest, NextResponse } from "next/server";
import { suppress } from "@/lib/suppression";
import { recordEvent } from "@/lib/events";
import { classify } from "@/lib/replies";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({} as any));
  const email: string = b?.email ?? "";
  const event: string = b?.event ?? "";
  const campaign: string = b?.campaign ?? "primary";
  const step: number = Number(b?.step ?? 0);
  const variant: string = b?.variant ?? "";
  const text: string = b?.text ?? b?.reply_text ?? "";

  if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });

  if (event === "hard_bounce" || event === "bounce") {
    await recordEvent({ email, campaign, step, variant, type: "bounce" });
    await suppress(email, "hard_bounce", "Instantly webhook");
    return NextResponse.json({ ok: true, action: "suppressed:bounce" });
  }
  if (event === "unsubscribe") {
    await recordEvent({ email, campaign, step, variant, type: "unsubscribe" });
    await suppress(email, "unsubscribe", "Instantly webhook");
    return NextResponse.json({ ok: true, action: "suppressed:unsubscribe" });
  }
  if (event === "reply") {
    await recordEvent({ email, campaign, step, variant, type: "reply" });
    const klass = classify(text);
    if (klass === "unsubscribe") {
      await suppress(email, "unsubscribe", "reply classified unsubscribe");
      return NextResponse.json({ ok: true, classified: klass, action: "suppressed" });
    }
    if (klass === "positive") {
      await recordEvent({ email, campaign, step, variant, type: "positive" });
      // TODO: notify + draft booking reply (human-in-the-loop).
      return NextResponse.json({ ok: true, classified: klass, action: "alert:positive" });
    }
    return NextResponse.json({ ok: true, classified: klass });
  }

  return NextResponse.json({ ok: true, ignored: event });
}
