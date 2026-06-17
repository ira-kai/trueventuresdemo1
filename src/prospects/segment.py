"""Cluster prospects into shared value angles so we write strong segment
templates, not 2,000 unique emails. Phase 2."""
from __future__ import annotations
from .base import Prospect


def segment(prospects: list[Prospect]) -> list[Prospect]:
    raise NotImplementedError("Phase 2")
