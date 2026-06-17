"""Classify replies: positive / objection / not_now / unsubscribe / referral /
ooo. Positives -> alert + drafted booking reply. unsubscribe & hard_bounce ->
auto-suppress via compliance.suppression. Phase 5."""
from __future__ import annotations
from enum import Enum


class ReplyType(str, Enum):
    POSITIVE = "positive"
    OBJECTION = "objection"
    NOT_NOW = "not_now"
    UNSUBSCRIBE = "unsubscribe"
    REFERRAL = "referral"
    OOO = "ooo"


def classify(reply_text: str) -> ReplyType:
    raise NotImplementedError("Phase 5 — wire ANTHROPIC_API_KEY")
