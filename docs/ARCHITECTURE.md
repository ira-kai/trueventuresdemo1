# Architecture

Next.js app on Vercel — the "brain" around Instantly (the sender).

```
  product.json ─► knowledge ─┐
  CSV / Apollo ─► csv ───────┤
                             ▼
                 segment ─► sequence ─► instantly export ──► INSTANTLY (send,
                             │            (leads.csv +          warmup, throttle)
                             ▼             steps.md)
                 assets: /for/[slug] landing pages              │
                                                                ▼
  compliance/suppression ◄── replies (classify) ◄── instantly-webhook ─► events
                             experiments (bandit) ◄──────────────┘   │
                             reporting (funnel, cost/positive) ◄──────┘
                             dashboard (/) renders funnel + goal
```

## Code map
- `lib/types.ts`        — shared domain types
- `lib/config.ts`       — goal constants (10/week @ 0.5–1%) ✅
- `lib/store.ts`        — storage seam (in-memory dev; swap for Vercel KV/Postgres)
- `lib/suppression.ts`  — compliance backstop; run `filterAllowed` before export ✅
- `lib/csv.ts`          — tolerant prospect CSV parse; unknown cols → hooks ✅
- `lib/knowledge.ts`    — product profile, segment match, value angle ✅
- `lib/sequence.ts`     — per-lead variables + 5-touch templates; AI opener if key ✅
- `lib/instantly.ts`    — export leads CSV + step templates ✅
- `lib/replies.ts`      — rule-based reply classifier + next action; AI refine if key ✅
- `lib/events.ts`       — outbound event log (everything derives from this) ✅
- `lib/experiments.ts`  — Beta-Bernoulli bandit: Thompson alloc + P(best) ✅
- `lib/reporting.ts`    — funnel, weekly positives vs target, cost/positive ✅
- `app/page.tsx`        — dashboard: live funnel + goal + cost/positive ✅
- `app/for/[slug]`      — personalized landing page (segment via ?seg=) ✅
- `app/api/unsubscribe` — CAN-SPAM opt-out → suppression ✅
- `app/api/instantly-webhook` — reply→classify/event, bounce/unsub→suppress ✅
- `app/api/generate`    — on-demand generation endpoint (stub: wire AI + persist)
- `scripts/demo.ts`     — full generation pipeline (`npm run demo`) ✅
- `scripts/simulate.ts` — bandit + reporting simulation (`npm run simulate`) ✅

✅ = built and verified by running.

## Guardrails (encoded, non-negotiable)
- Nothing here auto-sends or auto-spends; export-only, you press go in Instantly.
- Sample outputs labeled illustrative; no fabricated "we-analyzed-you" reports.
- Suppression + unsubscribe checked before any export, every run.

## Build status
- Done & verified: knowledge base, segmentation, sequence generation, Instantly
  export, reply classification, landing pages, event log, A/B bandit, funnel +
  cost reporting, dashboard. Bandit verified to shift ~85% traffic to the better
  variant and report P(best) ≈ 97%.
- Next: persist state in Vercel KV/Postgres (so the dashboard/suppression survive
  serverless) · real product profile → AI copy tier · `/api/generate` wiring.
