"""Email verification (ZeroBounce/NeverBounce). Mandatory: keeps bounce rate
under settings.sending.max_bounce_rate so domains survive. Phase 2."""
from __future__ import annotations
from .base import Prospect


def verify(prospects: list[Prospect]) -> list[Prospect]:
    """Return only deliverable addresses; invalids are dropped/flagged."""
    raise NotImplementedError("Phase 2 — wire EMAIL_VERIFY_API_KEY")
