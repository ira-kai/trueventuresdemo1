// Personalized per-account landing page — Vercel's sweet spot for this engine.
// In production the value angle is retrieved from the value-prop matrix (Phase 1)
// keyed by the prospect's company/segment. For now it renders a clean,
// product-agnostic frame from the slug so the route is live and deployable.
function titleCase(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AccountPage({ params }: { params: { slug: string } }) {
  const company = titleCase(params.slug);
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 12, color: "#999" }}>
        Prepared for
      </p>
      <h1 style={{ fontSize: 34, marginTop: 4 }}>{company}</h1>
      <p style={{ fontSize: 18, color: "#444", lineHeight: 1.6 }}>
        {/* Phase 1 fills this from the value-prop matrix (pain → OKR → proof). */}
        A short, specific case for how we move a metric {company} already cares
        about — populated per-segment once the product knowledge base is loaded.
      </p>
      <section style={{ marginTop: 32, padding: 20, border: "1px dashed #ccc", borderRadius: 10, background: "#fff" }}>
        <p style={{ fontSize: 12, color: "#b45309", margin: 0, fontWeight: 600 }}>
          ILLUSTRATIVE SAMPLE
        </p>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 0 }}>
          Example of the kind of output {company} would get — clearly labeled as a
          sample, never presented as real analysis we did not perform.
        </p>
      </section>
    </main>
  );
}
