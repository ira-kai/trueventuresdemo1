# Outbound Meeting Engine

A "brain" that sits on top of **Instantly** (the sending engine) and turns a product
description + a CSV of prospects into personalized, multi-step email sequences —
then learns from replies to book more meetings.

> **Division of labor.** Instantly handles inbox rotation, warmup, throttling, and
> reply detection. This repo handles everything upstream and downstream of that:
> knowing the product, deciding who gets what, generating sequences and assets,
> running experiments, classifying replies, and reporting against the goal.
> We do **not** rebuild the sender.

---

## Goal & the math behind it

Target: **10+ positive replies / week** at a **0.5–1% positive-reply rate**.

Working backwards:

| Quantity                         | Implication                          |
|----------------------------------|--------------------------------------|
| 10 positives ÷ ~0.75%            | ~1,300–2,000 sends / week            |
| ~200–400 sends / business day    | ~6–15 inboxes                        |
| ~2–3 inboxes / domain            | ~3–6 dedicated sending domains       |
| ~1,300–2,000 fresh contacts/week | email verification is **mandatory**  |

**The 10/week figure is a week 6–8 outcome, not week 1.** Weeks 1–3 are domain
warmup at low volume. The engine is built to ramp into that, not to fake it.

---

## Locked decisions

- **Platform:** Instantly (existing account). Export format targets Instantly.
- **Ingestion:** CSV now; Apollo later, behind the same `ProspectSource` interface.
- **Assets:** Personalized landing pages per account **+** clearly-labeled sample
  outputs. No fabricated "we-analyzed-your-systems" reports — they convert once,
  then collapse on follow-up and burn domain reputation.
- **Budget priority (cost per positive reply is tracked):**
  1. Email verification (cheap, protects deliverability)
  2. Sending domains / inboxes / warmup (the real bottleneck)
  3. Prospect incentives (gift cards) — only if reply rate stalls
  4. Page hosting (effectively free)
- **Geography:** US-only (CAN-SPAM scope).

---

## Two honest constraints baked into the design

1. **Deliverability is the bottleneck, not copy.** Compliance scaffolding
   (separate domains, SPF/DKIM/DMARC, suppression list, working unsubscribe,
   physical address, throttling) is what keeps the machine alive. Built in from
   day one — see `src/compliance/`.
2. **Statistics at this volume.** 10 positives/week is too sparse to A/B test
   *directly toward positive replies*. So: optimize subjects/send-times on
   opens+replies, test body/CTA on reply rate, and treat positive-reply rate as a
   slow north-star reviewed over multi-week windows (Bayesian updating, not
   per-variant p-values). Open tracking is inflated by Apple Mail Privacy
   Protection, so sequence logic keys on **replies**, not opens.

---

## Phased build order

- **Phase 0 — Foundation (this commit):** repo structure, architecture docs,
  config, compliance/suppression scaffolding, module interfaces.
- **Phase 1 — Knowledge base:** ingest product/ICP docs → compile the
  value-prop matrix (segment → pain → OKR → proof). *Needs your product docs.*
- **Phase 2 — Prospects:** CSV ingest + email verification + segmentation.
- **Phase 3 — Sequences:** 4–5 touch generator with per-prospect personalization;
  Instantly export.
- **Phase 4 — Assets:** personalized landing pages + labeled sample outputs.
- **Phase 5 — Experiments + replies:** A/B engine, reply classifier, alerts.
- **Phase 6 — Reporting:** funnel, per-segment performance, cost per positive reply.

See `docs/ARCHITECTURE.md` for the component detail.

## Setup (placeholder)

```bash
pip install -r requirements.txt
cp .env.example .env        # add your keys
cp config/settings.example.yaml config/settings.yaml
```
