# Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │              THE BRAIN (this repo)            │
                    │                                               │
  product docs ───► │  knowledge/   → value-prop matrix             │
  CSV / Apollo ───► │  prospects/   → verify, enrich, segment       │
                    │  sequences/   → personalized 4–5 touch copy   │
                    │  assets/      → landing pages + sample outputs │
                    │       │                                        │
                    │       ▼                                        │
                    │  platforms/instantly  ──── export sequences ──┼──► INSTANTLY
                    │                                                │   (send, warmup,
                    │  replies/     ◄──── reply data ────────────────┼──── throttle)
                    │  experiments/ → A/B logic + tracking (SQLite)  │
                    │  compliance/  → suppression, unsubscribe, CAN-SPAM │
                    │  reporting/   → funnel, cost per positive reply│
                    └─────────────────────────────────────────────┘
```

## Components

- **knowledge/** — ingest product/ICP/case-study docs; compile a value-prop matrix
  keyed by (title × industry × company-size). Personalization = retrieval against
  this matrix, not freestyle generation.
- **prospects/** — `ProspectSource` interface (CSV today, Apollo later) →
  email verification → segmentation into shared value angles.
- **sequences/** — segment templates with personalization slots, filled per
  prospect. 4–5 touches over ~2–3 weeks: hook → proof → new angle → breakup.
- **assets/** — per-account landing pages (`/for/<company>`) and clearly-labeled
  sample outputs. Honest-by-construction; nothing implies real analysis we didn't do.
- **platforms/instantly** — export sequences in Instantly's variable format; pull
  back send/reply data. The only component that touches the sender.
- **experiments/** — tracks delivered → reply → positive → meeting. Optimizes
  high-data signals (subject, send time) fast; treats positive-reply rate as a
  slow north-star. SQLite store.
- **replies/** — classify: positive / objection / not-now / unsubscribe / referral
  / OOO. Positives → alert + drafted booking reply. Unsub/bounce → auto-suppress.
- **compliance/** — suppression list, unsubscribe handling, throttle policy,
  CAN-SPAM requirements (physical address, honest from-line, opt-out).
- **reporting/** — funnel, per-experiment + per-segment performance, weekly
  positives vs. the 10 target, and cost per positive reply (budget plugs in here).

## Guardrails (non-negotiable, encoded in code)

- Nothing in this repo autonomously hits "send" or spends money. Sending and spend
  stay behind your Instantly account and your approval.
- No fabricated personalized analysis. Sample outputs are labeled as illustrative.
- Suppression + unsubscribe are checked before any export, every run.
