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

// ---- Knowledge base / value matrix (Phase 1) ----
export interface Segment {
  key: string;
  label: string;
  match: { titles: string[]; industries?: string[] };
  pain: string;
  okr: string;
  proofPoints: string[]; // illustrative unless sourced; never implies real analysis
}

export interface ProductProfile {
  name: string;
  oneLiner: string;
  placeholder: boolean; // true = demo placeholder, swap for real product
  segments: Segment[];
  defaultSegment: Segment;
}

export interface ValueAngle {
  segmentKey: string;
  segmentLabel: string;
  pain: string;
  okr: string;
  proofPoint: string;
}

// ---- Sequence generation (Phase 3) ----
export interface GeneratedLead {
  email: string;
  firstName: string;
  company: string;
  segment: string;
  // per-prospect personalization variables consumed by the step templates
  opener: string;
  valueLine: string;
  proofLine: string;
  landingUrl: string;
}

export interface SequenceStep {
  step: number;
  dayOffset: number;
  subjectVariants: string[]; // A/B tested by the experiment engine
  body: string;             // contains {{variables}} for Instantly
}
