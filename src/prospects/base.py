"""The seam every prospect source plugs into. CSV today, Apollo later — the rest
of the engine only ever talks to `ProspectSource`, so swapping the backend changes
nothing downstream."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Iterator


@dataclass
class Prospect:
    email: str
    first_name: str = ""
    last_name: str = ""
    title: str = ""
    company: str = ""
    industry: str = ""
    company_size: str = ""
    domain: str = ""
    # arbitrary enrichment signals -> become personalization "hooks"
    signals: dict = field(default_factory=dict)
    segment: str = ""

    @property
    def is_minimally_valid(self) -> bool:
        return bool(self.email and "@" in self.email)


class ProspectSource(ABC):
    """CSVSource and (later) ApolloSource implement this."""

    @abstractmethod
    def fetch(self) -> Iterator[Prospect]:
        ...
