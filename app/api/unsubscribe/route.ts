// Working unsubscribe endpoint (CAN-SPAM requires honoring opt-outs).
// GET /api/unsubscribe?email=foo@bar.com  -> adds to suppression list.
import { NextRequest, NextResponse } from "next/server";
import { suppress } from "@/lib/suppression";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "valid email required" }, { status: 400 });
  }
  await suppress(email, "unsubscribe", "via unsubscribe link");
  return new NextResponse(
    "You've been unsubscribed and will not be contacted again.",
    { status: 200, headers: { "content-type": "text/plain" } },
  );
}
