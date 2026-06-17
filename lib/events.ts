// Outbound event log. Everything (funnel, experiments) is derived from these.
// Stored one-per-key so it works on the KVStore interface (KV/Postgres in prod).
import { store } from "./store";

export type EventType =
  | "sent" | "delivered" | "reply" | "positive" | "meeting" | "bounce" | "unsubscribe";

export interface OutboundEvent {
  id: string;
  ts: string;        // ISO
  email: string;
  campaign: string;
  step: number;
  variant: string;   // e.g. "subject:A"
  type: EventType;
}

export async function recordEvent(e: Omit<OutboundEvent, "id" | "ts"> & Partial<Pick<OutboundEvent, "id" | "ts">>): Promise<OutboundEvent> {
  const full: OutboundEvent = {
    id: e.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: e.ts ?? new Date().toISOString(),
    ...e,
  } as OutboundEvent;
  await store.set(`event:${full.campaign}:${full.id}`, full);
  return full;
}

export async function listEvents(campaign: string): Promise<OutboundEvent[]> {
  return store.list<OutboundEvent>(`event:${campaign}:`);
}
