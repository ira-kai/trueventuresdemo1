// Compliance backstop: checked before any export to Instantly. An address lands
// here on unsubscribe, hard bounce, or spam complaint. Ported from Phase 0.
import { store } from "./store";
import type { SuppressionEntry, SuppressReason } from "./types";

const KEY = (email: string) => `suppress:${normalize(email)}`;

export function normalize(email: string): string {
  // Conservative: lowercase + trim only. We do NOT fold gmail dots/plus, since
  // that can collapse distinct B2B aliases.
  return (email ?? "").trim().toLowerCase();
}

export async function isSuppressed(email: string): Promise<boolean> {
  return (await store.get<SuppressionEntry>(KEY(email))) !== null;
}

export async function suppress(
  email: string,
  reason: SuppressReason,
  note = "",
): Promise<void> {
  const key = normalize(email);
  if (!key) return;
  await store.set<SuppressionEntry>(KEY(email), {
    email: key,
    reason,
    note,
    addedAt: new Date().toISOString(),
  });
}

// Use before every export. Returns which addresses are allowed vs blocked.
export async function filterAllowed(
  emails: string[],
): Promise<{ allowed: string[]; blocked: string[] }> {
  const allowed: string[] = [];
  const blocked: string[] = [];
  for (const e of emails) {
    (await isSuppressed(e)) ? blocked.push(e) : allowed.push(e);
  }
  return { allowed, blocked };
}
