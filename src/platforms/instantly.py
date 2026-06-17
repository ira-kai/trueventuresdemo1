"""The only component that touches the sender. Export sequences in Instantly's
variable format; pull back send/reply data. Never auto-fires sends — export only,
you press go in Instantly. Phase 3 (export) + Phase 5 (pull)."""
from __future__ import annotations


def export_campaign(sequences: list[dict], out_path: str) -> str:
    raise NotImplementedError("Phase 3")


def pull_replies(campaign_id: str) -> list[dict]:
    raise NotImplementedError("Phase 5 — wire INSTANTLY_API_KEY")
