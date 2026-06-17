// Dashboard shell. Phase 6 wires real funnel data; this is the deployable frame.
export default function Dashboard() {
  const targets = [
    { label: "Weekly positive replies (target)", value: "10+" },
    { label: "Target positive-reply rate", value: "0.5–1%" },
    { label: "Implied sends / week", value: "~1.3–2k" },
  ];
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Outbound Meeting Engine</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        Brain on top of Instantly: knowledge base → prospects → personalized
        sequences + landing pages → experiments → replies.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "24px 0" }}>
        {targets.map((t) => (
          <div key={t.label} style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, background: "#fff" }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{t.value}</div>
            <div style={{ fontSize: 12, color: "#777" }}>{t.label}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 14, color: "#555" }}>
        Example personalized landing page:{" "}
        <a href="/for/acme">/for/acme</a>
      </p>
    </main>
  );
}
