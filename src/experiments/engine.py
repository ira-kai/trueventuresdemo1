"""A/B engine + tracking (SQLite). Optimizes high-data signals (subject, send
time) on opens+replies; treats positive-reply rate as a slow north-star reviewed
over multi-week windows (Bayesian), never per-variant p-values at this volume.
Reply is the clean signal — open tracking is inflated by Apple MPP. Phase 5."""
from __future__ import annotations


class ExperimentEngine:
    def __init__(self, db_path: str = "data/experiments.sqlite"):
        self.db_path = db_path

    def record(self, *args, **kwargs):
        raise NotImplementedError("Phase 5")
