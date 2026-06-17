// Knowledge base: load the product profile and resolve a prospect's value angle.
// Personalization is RETRIEVAL against this matrix (segment -> pain/OKR/proof),
// not freestyle generation. Swap data/knowledge_base/product.json for the real
// product and every downstream sequence + landing page improves automatically.
//
// The profile is imported (not read from disk at runtime) so it bundles cleanly
// on Vercel and works identically in Next server components and scripts.
import productData from "../data/knowledge_base/product.json";
import type { Prospect, ProductProfile, Segment, ValueAngle } from "./types";

export function loadProduct(): ProductProfile {
  return productData as ProductProfile;
}

export function segmentByKey(key: string): Segment | null {
  const prod = loadProduct();
  if (key === prod.defaultSegment.key) return prod.defaultSegment;
  return prod.segments.find((s) => s.key === key) ?? null;
}

// Match by title keyword first (strongest signal), then nudge by industry.
export function matchSegment(prospect: Prospect, product?: ProductProfile): Segment {
  const prod = product ?? loadProduct();
  const title = (prospect.title ?? "").toLowerCase();
  const industry = (prospect.industry ?? "").toLowerCase();

  let best: { seg: Segment; score: number } | null = null;
  for (const seg of prod.segments) {
    let score = 0;
    for (const t of seg.match.titles) if (title && title.includes(t)) score += 2;
    for (const ind of seg.match.industries ?? [])
      if (industry && industry.includes(ind)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { seg, score };
  }
  return best?.seg ?? prod.defaultSegment;
}

export function angleFor(prospect: Prospect, product?: ProductProfile): ValueAngle {
  const seg = matchSegment(prospect, product);
  // Rotate proof point deterministically per company so repeats vary.
  const idx = seg.proofPoints.length
    ? hash(prospect.company ?? prospect.email) % seg.proofPoints.length
    : 0;
  return {
    segmentKey: seg.key,
    segmentLabel: seg.label,
    pain: seg.pain,
    okr: seg.okr,
    proofPoint: seg.proofPoints[idx] ?? "",
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
