// Personalized per-account landing page — Vercel's sweet spot for this engine.
// Segment comes from ?seg= (set by the generated landing URL), so the page is
// stateless and deploys cleanly. The value angle (pain/OKR/proof) is retrieved
// from the value-prop matrix; swap the product profile and this updates too.
import { segmentByKey, loadProduct } from "@/lib/knowledge";

function titleCase(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccountPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { seg?: string };
}) {
  const company = titleCase(params.slug);
  const seg = searchParams.seg ? segmentByKey(searchParams.seg) : null;
  const product = loadProduct();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 12, color: "#999" }}>
        Prepared for
      </p>
      <h1 style={{ fontSize: 34, marginTop: 4 }}>{company}</h1>

      {seg ? (
        <>
          <p style={{ fontSize: 18, color: "#444", lineHeight: 1.6 }}>
            Most {seg.label.toLowerCase()} we talk to are working on{" "}
            <strong>{seg.pain}</strong>. The metric that usually moves first is{" "}
            <strong>{seg.okr}</strong>.
          </p>
          <ul style={{ color: "#444", lineHeight: 1.8 }}>
            {seg.proofPoints.map((pt, i) => (
              <li key={i}>{pt.replace(/^illustrative:\s*/i, "")}</li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ fontSize: 18, color: "#444", lineHeight: 1.6 }}>
          A short, specific case for how we move a metric {company} already cares
          about — tailored per segment once the prospect&apos;s role is known.
        </p>
      )}

      <section style={{ marginTop: 32, padding: 20, border: "1px dashed #ccc", borderRadius: 10, background: "#fff" }}>
        <p style={{ fontSize: 12, color: "#b45309", margin: 0, fontWeight: 600 }}>
          ILLUSTRATIVE SAMPLE
        </p>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 0 }}>
          Example of the kind of output {company} would get — clearly labeled as a
          sample, never presented as real analysis we did not perform.
        </p>
      </section>

      {product.placeholder && (
        <p style={{ fontSize: 12, color: "#aaa", marginTop: 24 }}>
          (Demo content from a placeholder product profile.)
        </p>
      )}
    </main>
  );
}
