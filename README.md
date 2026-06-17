# Outbound Meeting Engine (Next.js / Vercel)

A "brain" on top of **Instantly** that turns a product description + a CSV of
prospects into personalized, multi-step email sequences and per-account landing
pages — then learns from replies to book more meetings. Instantly stays the
sending engine (warmup, rotation, throttling); this app is everything around it.

## Why Next.js on Vercel
- **Landing pages** (`/for/<company>`) are dynamic routes — Vercel's sweet spot.
- **Dashboard** + **webhooks** (unsubscribe, Instantly reply events) fit serverless.
- **Caveat:** bulk sequence generation and scheduling are *not* serverless-friendly
  (function timeouts, no local disk). Generation runs on-demand/chunked; persistent
  state (suppression, prospects, experiments) lives in a hosted store, not a file —
  see `lib/store.ts` (swap the in-memory dev impl for Vercel KV/Postgres in prod).

## Routes
- `/`                       — dashboard shell
- `/for/[slug]`             — personalized per-account landing page
- `GET  /api/unsubscribe`   — CAN-SPAM opt-out → suppression (working)
- `POST /api/generate`      — sequence generation (Phase 3)
- `POST /api/instantly-webhook` — reply/bounce ingest → suppression + classifier

## lib
- `types.ts`        — shared domain types
- `store.ts`        — storage interface (in-memory dev; KV/Postgres in prod)
- `suppression.ts`  — compliance backstop, checked before every export (working)
- `csv.ts`          — tolerant prospect CSV parser, unknown cols → hooks (working)

## Locked decisions
Instantly · CSV now / Apollo later · personalized pages **+** labeled samples (no
fabricated analysis) · budget priority: verification → sending infra → incentives
→ hosting · US-only (CAN-SPAM).

## Deploy
```bash
npm install
npm run build          # verify it compiles
# then either:
vercel                 # CLI, or
# connect the GitHub repo in the Vercel dashboard (auto-deploys on push)
```
Add env vars in Vercel: `ANTHROPIC_API_KEY`, `INSTANTLY_API_KEY`,
`EMAIL_VERIFY_API_KEY` (Apollo later). See `docs/ARCHITECTURE.md` for the build order.
