// Reply classification. Positives trigger a booking-reply draft; unsubscribe and
// hard bounces feed the suppression list. Rule-based by default (runs with no
// key); classifyAI() refines when ANTHROPIC_API_KEY is set.
export type ReplyType =
  | "positive"
  | "objection"
  | "not_now"
  | "unsubscribe"
  | "referral"
  | "ooo";

const RULES: [ReplyType, RegExp][] = [
  ["unsubscribe", /\b(unsubscribe|remove me|take me off|stop emailing|opt out)\b/i],
  ["ooo", /\b(out of office|o{3}|on leave|annual leave|vacation|maternity|back (on|in)|until\s+\w+\s*\d)\b/i],
  ["referral", /\b(talk to|reach out to|forward(ed)? (you|this) to|the right person is|loop in|not me, )\b/i],
  ["objection", /\b(not interested|no thanks|already (have|use|using)|too expensive|not a fit|please stop|why are you)\b/i],
  ["not_now", /\b(not (right )?now|next quarter|circle back|swamped|bad timing|maybe later|q[1-4])\b/i],
  ["positive", /\b(interested|sounds good|happy to|let'?s (chat|talk|meet)|book a|calendar|works for me|send (a )?(time|invite)|tell me more)\b/i],
];

export function classify(text: string): ReplyType {
  const t = text || "";
  for (const [type, re] of RULES) if (re.test(t)) return type;
  return "objection"; // conservative default: don't over-claim a positive
}

// Suggested next action per class — keeps a human in the loop, never auto-sends.
export function nextAction(type: ReplyType): string {
  switch (type) {
    case "positive": return "ALERT + draft booking reply with scheduling link";
    case "referral": return "draft intro-request reply; add referred contact to queue";
    case "not_now": return "snooze; re-sequence after stated window";
    case "objection": return "log reason; suppress from this campaign";
    case "unsubscribe": return "SUPPRESS immediately";
    case "ooo": return "pause; resume after return date";
  }
}
