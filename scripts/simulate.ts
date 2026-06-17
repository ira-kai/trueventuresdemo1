// Verifies the experiment engine + reporting by simulating a campaign.
// Two subject variants with DIFFERENT true reply rates; the bandit should shift
// allocation toward the better one and report it as most likely best.
// Run: `npm run simulate`.
import { ExperimentEngine } from "../lib/experiments";
import { recordEvent, listEvents } from "../lib/events";
import { funnel, weeklyPositives, costPerPositive } from "../lib/reporting";

const CAMPAIGN = "sim";
const EXP = "step1-subject";
const VARIANTS = ["A", "B"];
const TRUE_REPLY = { A: 0.04, B: 0.065 }; // B is genuinely better
const DELIVER_RATE = 0.97;
const POSITIVE_GIVEN_REPLY = 0.5;
const N = 1500;

function bernoulli(p: number) { return Math.random() < p; }

async function main() {
  const eng = new ExperimentEngine();
  eng.ensureVariants(EXP, VARIANTS);
  const alloc: Record<string, number> = { A: 0, B: 0 };

  for (let i = 0; i < N; i++) {
    const v = eng.pick(EXP, VARIANTS);     // Thompson allocation
    alloc[v]++;
    await recordEvent({ email: `p${i}@x.com`, campaign: CAMPAIGN, step: 1, variant: `subject:${v}`, type: "sent" });
    const delivered = bernoulli(DELIVER_RATE);
    if (delivered) await recordEvent({ email: `p${i}@x.com`, campaign: CAMPAIGN, step: 1, variant: `subject:${v}`, type: "delivered" });
    const replied = delivered && bernoulli(TRUE_REPLY[v as "A" | "B"]);
    eng.record(EXP, v, replied);            // success metric = reply
    if (replied) {
      await recordEvent({ email: `p${i}@x.com`, campaign: CAMPAIGN, step: 1, variant: `subject:${v}`, type: "reply" });
      if (bernoulli(POSITIVE_GIVEN_REPLY))
        await recordEvent({ email: `p${i}@x.com`, campaign: CAMPAIGN, step: 1, variant: `subject:${v}`, type: "positive" });
    }
  }

  console.log(`True reply rates: A=${TRUE_REPLY.A}  B=${TRUE_REPLY.B}  (B is better)\n`);
  console.log(`Thompson allocation over ${N} sends:  A=${alloc.A}  B=${alloc.B}`);
  console.log(`  -> ${((alloc.B / N) * 100).toFixed(0)}% of traffic went to the better variant\n`);

  console.log("Posterior summary:");
  for (const s of eng.summary(EXP)) {
    console.log(
      `  ${s.variant}: obs=${(s.mean * 100).toFixed(2)}%  ` +
      `95%CI=[${(s.ci95[0] * 100).toFixed(2)}%, ${(s.ci95[1] * 100).toFixed(2)}%]  ` +
      `P(best)=${(s.pBest * 100).toFixed(1)}%  (n=${s.trials})`,
    );
  }

  const events = await listEvents(CAMPAIGN);
  const f = funnel(events);
  console.log(`\nFunnel: sent=${f.sent} delivered=${f.delivered} replied=${f.replied} positive=${f.positive}`);
  console.log(`  reply rate=${(f.replyRate * 100).toFixed(2)}%  positive rate=${(f.positiveRate * 100).toFixed(2)}%`);

  const wk = weeklyPositives(events);
  console.log(`\nWeekly positives: ${wk.count} / ${wk.target} target  (onTrack=${wk.onTrack})`);

  const SAMPLE_SPEND = 600; // pretend this campaign cost $600
  const cpp = costPerPositive(events, SAMPLE_SPEND);
  console.log(`Cost per positive @ $${SAMPLE_SPEND} spend: ${cpp ? "$" + cpp.toFixed(2) : "n/a"}`);
}

main();
