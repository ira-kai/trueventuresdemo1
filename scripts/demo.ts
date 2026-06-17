// End-to-end pipeline on sample prospects. Runnable: `npx tsx scripts/demo.ts`.
// CSV -> suppression filter -> segment -> generate leads + steps -> Instantly export.
import { parseProspects } from "../lib/csv";
import { buildLead, buildSteps, slugify } from "../lib/sequence";
import { leadsToCsv, stepsToMarkdown } from "../lib/instantly";
import { filterAllowed, suppress } from "../lib/suppression";
import { matchSegment, loadProduct } from "../lib/knowledge";

const BASE_URL = "https://demo.example.com";

const SAMPLE_CSV = [
  "First Name,Email Address,Job Title,Company,Industry,Funding",
  "Dana,dana@acme.io,VP of Engineering,Acme,SaaS,Series B",
  "Priya,priya@northstar.com,Chief Data Officer,Northstar Retail,Ecommerce,",
  "Marcus,marcus@helmlogistics.com,COO,Helm Logistics,Logistics,hiring 40 ops roles",
  "Sam,sam@quietco.com,Founder,QuietCo,,",
  "Optout,optout@acme.io,VP of Engineering,Acme,SaaS,",
].join("\n");

async function main() {
  const product = loadProduct();
  console.log(`Product: ${product.name}  (placeholder=${product.placeholder})\n`);

  // Pretend this person already unsubscribed.
  await suppress("optout@acme.io", "unsubscribe", "demo seed");

  const prospects = parseProspects(SAMPLE_CSV);
  const { allowed, blocked } = await filterAllowed(prospects.map((p) => p.email));
  console.log(`Parsed ${prospects.length} | allowed ${allowed.length} | suppressed ${blocked.length} (${blocked.join(", ")})\n`);

  const sendable = prospects.filter((p) => allowed.includes(p.email));
  const leads = sendable.map((p) => {
    const seg = matchSegment(p);
    console.log(`  ${p.email.padEnd(28)} ${(p.title||"").padEnd(22)} -> ${seg.key}  (/for/${slugify(p.company||"")})`);
    return buildLead(p, BASE_URL);
  });

  const steps = buildSteps();
  console.log("\n--- sample lead variables (first prospect) ---");
  console.log(JSON.stringify(leads[0], null, 2));
  console.log("\n--- rendered step 1 for first prospect ---");
  console.log(render(steps[0].body, leads[0]));

  // Write export artifacts.
  const fs = await import("fs");
  fs.mkdirSync("data/outputs", { recursive: true });
  fs.writeFileSync("data/outputs/leads.csv", leadsToCsv(leads));
  fs.writeFileSync("data/outputs/sequence_steps.md", stepsToMarkdown(steps));
  console.log("\nWrote data/outputs/leads.csv and data/outputs/sequence_steps.md");
}

function render(body: string, lead: any): string {
  return body
    .replace(/\{\{firstName\}\}/g, lead.firstName)
    .replace(/\{\{company\}\}/g, lead.company)
    .replace(/\{\{opener\}\}/g, lead.opener)
    .replace(/\{\{valueLine\}\}/g, lead.valueLine)
    .replace(/\{\{proofLine\}\}/g, lead.proofLine)
    .replace(/\{\{landingUrl\}\}/g, lead.landingUrl)
    .replace(/\{\{unsubscribe\}\}/g, "[Unsubscribe]");
}

main();
