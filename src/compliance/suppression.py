"""Suppression list: the compliance backstop checked before any send/export.

An email lands on the suppression list when it unsubscribes, hard-bounces, marks
spam, or is manually excluded. Nothing should ever be exported to Instantly without
passing through `filter_allowed` first.

This module is intentionally dependency-free and runnable today.
"""
from __future__ import annotations

import csv
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path


class Reason(str, Enum):
    UNSUBSCRIBE = "unsubscribe"
    HARD_BOUNCE = "hard_bounce"
    SPAM_COMPLAINT = "spam_complaint"
    MANUAL = "manual"


def normalize(email: str) -> str:
    """Lowercase + strip. (Gmail dot/plus folding intentionally not applied —
    that can collapse distinct B2B aliases; keep it conservative.)"""
    return (email or "").strip().lower()


@dataclass
class SuppressionList:
    path: Path = field(default=Path("data/suppression.csv"))
    _entries: dict[str, dict] = field(default_factory=dict, init=False)

    def __post_init__(self) -> None:
        self.path = Path(self.path)
        if self.path.exists():
            with self.path.open(newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    self._entries[normalize(row["email"])] = row

    def is_suppressed(self, email: str) -> bool:
        return normalize(email) in self._entries

    def add(self, email: str, reason: Reason, note: str = "") -> None:
        key = normalize(email)
        if not key:
            return
        self._entries[key] = {
            "email": key,
            "reason": reason.value if isinstance(reason, Reason) else str(reason),
            "note": note,
            "added_at": datetime.now(timezone.utc).isoformat(),
        }
        self._flush()

    def filter_allowed(self, emails: list[str]) -> tuple[list[str], list[str]]:
        """Return (allowed, blocked). Use this before every export."""
        allowed, blocked = [], []
        for e in emails:
            (blocked if self.is_suppressed(e) else allowed).append(e)
        return allowed, blocked

    def _flush(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fields = ["email", "reason", "note", "added_at"]
        with self.path.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields)
            w.writeheader()
            for row in self._entries.values():
                w.writerow({k: row.get(k, "") for k in fields})

    def __len__(self) -> int:
        return len(self._entries)


if __name__ == "__main__":
    s = SuppressionList(path=Path("data/outputs/_demo_suppression.csv"))
    s.add("OptOut@Example.com", Reason.UNSUBSCRIBE, "demo")
    allowed, blocked = s.filter_allowed(["new@acme.com", "optout@example.com"])
    print(f"allowed={allowed} blocked={blocked} list_size={len(s)}")
    os.remove(s.path)
