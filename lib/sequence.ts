// Sequence generation: per-prospect personalization variables + shared step
// templates. This is the "strong segment templates with personalization slots"
// approach — not 2,000 unique emails. The step bodies carry {{variables}} that
// Instantly fills from the per-lead CSV (see lib/instantly.ts).
//
// Copy quality has two tiers:
//   - deterministic (default, no API key): grounded, safe, runnable today
//   - AI (when ANTHROPIC_API_KEY set): richer openers via generateOpenerAI()
import type { GeneratedLead, Prospect, SequenceStep, ValueAngle } from "./types";
import { angleFor } from "./knowledge";

export function slugify(s: string): string {
  return (s || "account")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "account";
}

// Turn an enrichment signal into a natural first line, else fall back to pain.
// Light heuristics on the signal type keep the deterministic copy from reading
// like a mail-merge; the AI path (generateOpenerAI) does better when available.
function signalPhrase(company: string, _key: string, val: string): string | null {
  if (!val) return null;
  const v = val.toLowerCase();
  if (/series\s|seed|raised|\bround\b|\$|funding/.test(v)) {
    const amt = /series|seed/.test(v) ? `raised ${val}` : val;
    return `Saw ${company} ${amt}`;
  }
  if (/hir|role|opening|headcount|growing the team/.test(v)) {
    return `Saw ${company} is ${val}`;
  }
  return `Noticed this on ${company}: ${val}`;
}

function deterministicOpener(p: Prospect, angle: ValueAngle): string {
  const company = p.company || "your team";
  const hookKey = Object.keys(p.signals)[0];
  const phrase = hookKey ? signalPhrase(company, hookKey, p.signals[hookKey]) : null;
  if (phrase) {
    return `${phrase} — and that's usually right when ${angle.pain} gets harder.`;
  }
  if (angle.segmentKey === "general") {
    return `A lot of teams like ${company} are dealing with ${angle.pain} right now.`;
  }
  return `Talking to ${angle.segmentLabel.toLowerCase()} at teams like ${company}, ${angle.pain} keeps coming up.`;
}

export function buildLead(
  prospect: Prospect,
  baseUrl: string,
  openerOverride?: string,
): GeneratedLead {
  const angle = angleFor(prospect);
  const company = prospect.company || "your company";
  const opener = openerOverride ?? deterministicOpener(prospect, angle);
  return {
    email: prospect.email,
    firstName: prospect.firstName || "there",
    company,
    segment: angle.segmentKey,
    opener,
    valueLine: `We help teams move ${angle.okr} in the right direction without adding headcount.`,
    proofLine: `For context — ${angle.proofPoint}.`,
    landingUrl: `${baseUrl.replace(/\/$/, "")}/for/${slugify(company)}?seg=${angle.segmentKey}`,
  };
}

// Shared 5-touch templates. {{vars}} resolved by Instantly from the lead CSV.
// Cold-email norms: short, one ask, plain text, unsubscribe present (CAN-SPAM).
export function buildSteps(): SequenceStep[] {
  return [
    {
      step: 1,
      dayOffset: 0,
      subjectVariants: ["quick idea for {{company}}", "{{company}} + a 2-line idea"],
      body:
        "Hi {{firstName}},\n\n{{opener}} {{valueLine}}\n\nWorth a quick look — open to it?\n\n{{unsubscribe}}",
    },
    {
      step: 2,
      dayOffset: 3,
      subjectVariants: ["re: quick idea for {{company}}", "one example, {{firstName}}"],
      body:
        "Hi {{firstName}},\n\n{{proofLine}}\n\nPut together a short page for {{company}}: {{landingUrl}}\n\n15 minutes next week to see if it maps?\n\n{{unsubscribe}}",
    },
    {
      step: 3,
      dayOffset: 4,
      subjectVariants: ["different angle for {{company}}", "{{firstName}} — a thought"],
      body:
        "Hi {{firstName}},\n\nDifferent angle: even a small move on this tends to free up the team for the work that actually compounds.\n\nWho on your side owns this — you, or should I be talking to someone else?\n\n{{unsubscribe}}",
    },
    {
      step: 4,
      dayOffset: 5,
      subjectVariants: ["still worth 15 min?", "{{company}} — quick bump"],
      body:
        "Hi {{firstName}},\n\nBumping this once in case it slipped. Happy to send the 2-line version instead of a meeting if that's easier.\n\n{{unsubscribe}}",
    },
    {
      step: 5,
      dayOffset: 6,
      subjectVariants: ["closing the loop", "last one, {{firstName}}"],
      body:
        "Hi {{firstName}},\n\nI'll stop here so I'm not cluttering your inbox. If the timing's ever better, just reply and I'll pick it back up.\n\nThanks for reading.\n\n{{unsubscribe}}",
    },
  ];
}

// AI opener (activates only when ANTHROPIC_API_KEY is set). Unverified without a
// key; the deterministic path above is the tested default.
export async function generateOpenerAI(
  prospect: Prospect,
  angle: ValueAngle,
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 80,
        messages: [
          {
            role: "user",
            content:
              `Write ONE plain, specific cold-email opener (max 25 words) for ` +
              `${prospect.firstName || "a prospect"}, ${prospect.title || "a leader"} at ` +
              `${prospect.company || "their company"}. Their likely pain: ${angle.pain}. ` +
              `Signals: ${JSON.stringify(prospect.signals)}. No hype, no "I hope this finds you well". ` +
              `Return only the sentence.`,
          },
        ],
      }),
    });
    const data = await res.json();
    const text = (data?.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join(" ")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}
