// Dashboard: funnel + weekly positives vs target + cost per positive.
// Reads real events from the store; empty until a persistent store + webhook
// are wired (in-memory dev store resets per serverless invocation).
import { listEvents } from "@/lib/events";
import { funnel, weeklyPositives, costPerPositive } from "@/lib/reporting";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const events = await listEvents("primary");
  const f = funnel(events);
  const wk = weeklyPositives(events);
  const cpp = costPerPositive(events, null); // null budget -> shows "set budget"

  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const stages = [
    { label: "Sent", value: f.sent },
    { label: "Delivered", value: f.delivered, sub: pct(f.deliveredRate) },
    { label: "Replied", value: f.replied, sub: pct(f.replyRate) },
    { label: "Positive", value: f.positive, sub: pct(f.positiveRate) },
    { label: "Meetings", value: f.meeting },
  ];

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Outbound Meeting Engine</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        Brain on top of Instantly: knowledge base → prospects → personalized
        sequences + landing pages → experiments → replies.
      </p>

      <div style={{ display: "flex", gap: 12, margin: "20px 0", flexWrap: "wrap" }}>
        <Card big label="Positives this week" value={`${wk.count} / ${wk.target}`}
          tone={wk.onTrack ? "#16a34a" : "#b45309"} />
        <Card big label="Cost / positive" value={cpp == null ? "set budget" : `$${cpp.toFixed(0)}`} />
      </div>

      <h2 style={{ fontSize: 16, color: "#444" }}>Funnel</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {stages.map((s) => (
          <div key={s.label} style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 14, background: "#fff" }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#777" }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 11, color: "#aaa" }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <p style={{ fontSize: 13, color: "#999", marginTop: 16 }}>
          No events yet. Wire a persistent store (Vercel KV/Postgres) + the
          Instantly webhook to populate this. Try the engine now with{" "}
          <code>npm run simulate</code>. Sample landing page: <a href="/for/acme?seg=eng-leader">/for/acme</a>
        </p>
      )}
    </main>
  );
}

function Card({ label, value, sub, tone, big }: { label: string; value: string; sub?: string; tone?: string; big?: boolean }) {
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, background: "#fff", minWidth: 160 }}>
      <div style={{ fontSize: big ? 26 : 20, fontWeight: 700, color: tone ?? "#111" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#777" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#aaa" }}>{sub}</div>}
    </div>
  );
}
