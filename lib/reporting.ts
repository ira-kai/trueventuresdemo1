// Funnel + goal tracking + cost per positive. Budget plugs in via totalSpendUsd.
import type { OutboundEvent } from "./events";
import { GOAL } from "./config";

export interface Funnel {
  sent: number; delivered: number; replied: number; positive: number; meeting: number;
  deliveredRate: number; replyRate: number; positiveRate: number; meetingRate: number;
}

export function funnel(events: OutboundEvent[]): Funnel {
  const c = (t: string) => events.filter((e) => e.type === t).length;
  const sent = c("sent"), delivered = c("delivered"), replied = c("reply");
  const positive = c("positive"), meeting = c("meeting");
  const safe = (n: number, d: number) => (d > 0 ? n / d : 0);
  return {
    sent, delivered, replied, positive, meeting,
    deliveredRate: safe(delivered, sent),
    replyRate: safe(replied, delivered || sent),
    positiveRate: safe(positive, delivered || sent),
    meetingRate: safe(meeting, positive),
  };
}

export function weeklyPositives(events: OutboundEvent[], now = Date.now()): { count: number; target: number; onTrack: boolean } {
  const weekAgo = now - 7 * 24 * 3600 * 1000;
  const count = events.filter((e) => e.type === "positive" && Date.parse(e.ts) >= weekAgo).length;
  return { count, target: GOAL.weeklyPositiveTarget, onTrack: count >= GOAL.weeklyPositiveTarget };
}

export function costPerPositive(events: OutboundEvent[], totalSpendUsd: number | null): number | null {
  if (totalSpendUsd == null) return null;
  const positives = events.filter((e) => e.type === "positive").length;
  return positives > 0 ? totalSpendUsd / positives : null;
}
