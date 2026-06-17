// Tolerant CSV prospect ingest. Handles the messy header variants real exports
// use; unrecognized populated columns become personalization "hooks". Ported
// from Phase 0. Minimal quoted-field-aware parser (no dependency).
import type { Prospect } from "./types";

const ALIASES: Record<string, string[]> = {
  email: ["email", "email address", "work email", "e-mail"],
  firstName: ["first name", "first", "firstname", "given name"],
  lastName: ["last name", "last", "lastname", "surname"],
  title: ["title", "job title", "position", "role"],
  company: ["company", "company name", "organization", "account"],
  industry: ["industry", "sector", "vertical"],
  companySize: ["company size", "employees", "headcount", "size", "# employees"],
  domain: ["domain", "website", "company domain", "url"],
};

const KNOWN = new Map<string, string>();
for (const [canon, aliases] of Object.entries(ALIASES))
  for (const a of aliases) KNOWN.set(a, canon);

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

export function parseProspects(csvText: string): Prospect[] {
  const lines = csvText.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.length);
  if (!lines.length) return [];
  const headers = parseLine(lines[0]).map((h) => h.trim());
  const colmap = headers.map((h) => KNOWN.get(h.toLowerCase()) ?? null);

  const prospects: Prospect[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = parseLine(lines[r]);
    const p: Prospect = { email: "", signals: {} };
    cells.forEach((raw, i) => {
      const value = (raw ?? "").trim();
      const canon = colmap[i];
      if (canon) (p as any)[canon] = value;
      else if (value) p.signals[headers[i].toLowerCase()] = value;
    });
    if (p.email) {
      p.email = p.email.trim().toLowerCase();
      prospects.push(p);
    }
  }
  return prospects;
}
