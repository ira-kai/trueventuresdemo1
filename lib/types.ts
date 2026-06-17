// Canonical domain types shared across the engine.

export interface Prospect {
  email: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  domain?: string;
  // unrecognized-but-populated CSV columns become personalization "hooks"
  signals: Record<string, string>;
  segment?: string;
}

export type SuppressReason =
  | "unsubscribe"
  | "hard_bounce"
  | "spam_complaint"
  | "manual";

export interface SuppressionEntry {
  email: string;
  reason: SuppressReason;
  note?: string;
  addedAt: string;
}
