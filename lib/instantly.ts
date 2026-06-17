// Instantly export. Two artifacts, matching how Instantly actually works:
//   1) leads CSV  — one row per prospect with personalization variables
//   2) step templates — the sequence you paste into Instantly's campaign builder,
//      using {{variables}} that map to the CSV columns.
// filterAllowed() MUST run before export so suppressed addresses never go out.
import type { GeneratedLead, SequenceStep } from "./types";

const LEAD_COLUMNS = [
  "email",
  "firstName",
  "company",
  "segment",
  "opener",
  "valueLine",
  "proofLine",
  "landingUrl",
] as const;

function csvCell(v: string): string {
  const s = v ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leadsToCsv(leads: GeneratedLead[]): string {
  const header = LEAD_COLUMNS.join(",");
  const rows = leads.map((l) =>
    LEAD_COLUMNS.map((c) => csvCell(String((l as any)[c] ?? ""))).join(","),
  );
  return [header, ...rows].join("\n");
}

export function stepsToMarkdown(steps: SequenceStep[]): string {
  const out: string[] = ["# Instantly sequence steps", ""];
  for (const s of steps) {
    out.push(`## Step ${s.step} — send day +${s.dayOffset}`);
    out.push(`**Subject A/B:**`);
    s.subjectVariants.forEach((v, i) => out.push(`- ${String.fromCharCode(65 + i)}: ${v}`));
    out.push("", "```", s.body, "```", "");
  }
  out.push(
    "_Variables ({{firstName}}, {{company}}, {{opener}}, {{valueLine}}, " +
      "{{proofLine}}, {{landingUrl}}) map to the leads CSV columns. " +
      "{{unsubscribe}} is Instantly's built-in unsubscribe tag._",
  );
  return out.join("\n");
}
