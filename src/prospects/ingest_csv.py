"""CSV prospect ingest. Tolerant of the messy header variants real exports use
(Apollo, Sales Navigator scrapes, hand-built lists). Runnable today."""
from __future__ import annotations

import csv
from pathlib import Path
from typing import Iterator

from .base import Prospect, ProspectSource

# Map many possible header spellings onto our canonical fields.
_ALIASES = {
    "email": {"email", "email address", "work email", "e-mail"},
    "first_name": {"first name", "first", "firstname", "given name"},
    "last_name": {"last name", "last", "lastname", "surname"},
    "title": {"title", "job title", "position", "role"},
    "company": {"company", "company name", "organization", "account"},
    "industry": {"industry", "sector", "vertical"},
    "company_size": {"company size", "employees", "headcount", "size", "# employees"},
    "domain": {"domain", "website", "company domain", "url"},
}
_KNOWN = {alias: canon for canon, aliases in _ALIASES.items() for alias in aliases}


def _canonical(header: str) -> str | None:
    return _KNOWN.get((header or "").strip().lower())


class CSVSource(ProspectSource):
    def __init__(self, path: str | Path):
        self.path = Path(path)

    def fetch(self) -> Iterator[Prospect]:
        with self.path.open(newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            colmap = {h: _canonical(h) for h in (reader.fieldnames or [])}
            for raw in reader:
                fields: dict = {}
                signals: dict = {}
                for header, value in raw.items():
                    canon = colmap.get(header)
                    if canon:
                        fields[canon] = (value or "").strip()
                    elif value and value.strip():
                        # unrecognized but populated -> keep as a signal/hook
                        signals[(header or "").strip().lower()] = value.strip()
                if fields.get("email"):
                    fields["email"] = fields["email"].strip().lower()
                yield Prospect(signals=signals, **fields)


if __name__ == "__main__":
    import io, tempfile, os
    sample = io.StringIO()
    w = csv.writer(sample)
    w.writerow(["First Name", "Email Address", "Job Title", "Company", "Funding"])
    w.writerow(["Dana", "dana@acme.io", "VP Eng", "Acme", "Series B"])
    tmp = Path(tempfile.mktemp(suffix=".csv"))
    tmp.write_text(sample.getvalue())
    for p in CSVSource(tmp).fetch():
        print(p)
    os.remove(tmp)
