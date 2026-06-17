"""Value-prop matrix: the heart of personalization.

Compiles ingested product/ICP/case-study docs into a lookup keyed by
(title x industry x company_size) -> {pain, mapped_OKR, proof_points}.
Sequence generation retrieves from this rather than freestyling, which is how
personalization stays grounded and scales without becoming slop.

Phase 1. Needs the product docs to produce anything real.
"""
from __future__ import annotations
from dataclasses import dataclass


@dataclass
class ValueAngle:
    segment_key: str          # e.g. "VP Eng|SaaS|201-500"
    pain: str
    mapped_okr: str
    proof_points: list[str]


def build_matrix(knowledge_dir: str) -> dict[str, ValueAngle]:
    raise NotImplementedError("Phase 1 — needs product docs in data/knowledge_base/")
