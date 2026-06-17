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
  compliance/suppression ◄── replies (classify) ◄── instantly-webhook
                 reporting (funnel, cost/positive) ─ Phase 6
```

## Code map
- `lib/types.ts`        — shared domain types
- `lib/store.ts`        — storage seam (in-memory dev; swap for Vercel KV/Postgres)
- `lib/suppression.ts`  — compliance backstop; run `filterAllowed` before every export ✅
- `lib/csv.ts`          — tolerant prospect CSV parse; unknown cols → hooks ✅
- `lib/knowledge.ts`    — load product profile, match segment, resolve value angle ✅
- `lib/sequence.ts`     — per-lead variables + 5-touch step templates; AI opener if key ✅
- `lib/instantly.ts`    — export leads CSV + step templates ✅
- `lib/replies.ts`      — rule-based reply classifier + next action; AI refine if key ✅
- `app/page.tsx`        — dashboard shell
- `app/for/[slug]`      — personalized landing page (segment via ?seg=) ✅
- `app/api/unsubscribe` — CAN-SPAM opt-out → suppression ✅
- `app/api/instantly-webhook` — bounce/unsub → suppression; reply → classifier
- `app/api/generate`    — on-demand generation endpoint (wire AI + persist)
- `scripts/demo.ts`     — end-to-end pipeline on sample data (`npm run demo`) ✅

✅ = built and verified by running. Others are interfaces/stubs.

## Guardrails (encoded, non-negotiable)
- Nothing here auto-sends or auto-spends; export-only, you press go in Instantly.
- Sample outputs are labeled illustrative; no fabricated "we-analyzed-you" reports.
- Suppression + unsubscribe checked before any export, every run.

## Build status
- Done: knowledge base, segmentation, sequence generation, Instantly export,
  reply classification, landing pages. All run end-to-end on a placeholder product.
- Next: real product profile (replaces the placeholder) → AI copy tier → persist
  state in Vercel KV/Postgres → experiment engine + funnel reporting.
