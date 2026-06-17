// A/B experiment engine — Beta-Bernoulli bandit.
//
// Why this shape (not classic p-value A/B): at ~10 positives/week, fixed-horizon
// significance testing is underpowered and slow. A bandit keeps exploring while
// shifting traffic toward what's working, and reports P(variant is best) instead
// of a binary "significant yet?". Optimize high-data signals (subject, send time)
// on replies; treat positive-reply rate as a slow north-star over multi-week windows.
//
// Allocation: Thompson sampling (draw a rate from each arm's posterior, send the
// next email with the winning variant). Summary: Monte-Carlo posterior with mean,
// 95% credible interval, and P(best).
import { store } from "./store";

export interface Arm { variant: string; trials: number; successes: number }
export type ExperimentState = Record<string, Record<string, Arm>>; // expId -> variant -> arm

// ---- posterior sampling (Beta via two Gammas; Marsaglia-Tsang, shape >= 1) ----
function randn(): number {
  const u1 = Math.random() || 1e-12;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function gammaSample(shape: number): number {
  // shape >= 1 always here (alpha=1+successes, beta=1+failures)
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x = randn();
    let v = (1 + c * x) ** 3;
    if (v <= 0) continue;
    const u = Math.random();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function betaSample(a: number, b: number): number {
  const ga = gammaSample(a);
  const gb = gammaSample(b);
  return ga / (ga + gb);
}
function postParams(arm: Arm): [number, number] {
  return [1 + arm.successes, 1 + (arm.trials - arm.successes)]; // Beta(alpha, beta)
}

export class ExperimentEngine {
  constructor(private state: ExperimentState = {}) {}

  private ensure(expId: string, variant: string): Arm {
    const arms = (this.state[expId] ??= {});
    return (arms[variant] ??= { variant, trials: 0, successes: 0 });
  }

  ensureVariants(expId: string, variants: string[]): void {
    for (const v of variants) this.ensure(expId, v);
  }

  record(expId: string, variant: string, success: boolean): void {
    const arm = this.ensure(expId, variant);
    arm.trials += 1;
    if (success) arm.successes += 1;
  }

  // Thompson sampling: pick the variant whose posterior draw is highest.
  pick(expId: string, variants: string[]): string {
    let best = variants[0];
    let bestDraw = -1;
    for (const v of variants) {
      const [a, b] = postParams(this.ensure(expId, v));
      const draw = betaSample(a, b);
      if (draw > bestDraw) { bestDraw = draw; best = v; }
    }
    return best;
  }

  summary(expId: string, iters = 4000): Array<{
    variant: string; trials: number; successes: number; mean: number;
    ci95: [number, number]; pBest: number;
  }> {
    const arms = Object.values(this.state[expId] ?? {});
    if (!arms.length) return [];
    const draws: Record<string, number[]> = {};
    const wins: Record<string, number> = {};
    for (const a of arms) { draws[a.variant] = []; wins[a.variant] = 0; }
    for (let i = 0; i < iters; i++) {
      let bestV = arms[0].variant, bestX = -1;
      for (const a of arms) {
        const [al, be] = postParams(a);
        const x = betaSample(al, be);
        draws[a.variant].push(x);
        if (x > bestX) { bestX = x; bestV = a.variant; }
      }
      wins[bestV] += 1;
    }
    return arms.map((a) => {
      const s = draws[a.variant].slice().sort((p, q) => p - q);
      const q = (f: number) => s[Math.min(s.length - 1, Math.floor(f * s.length))];
      return {
        variant: a.variant,
        trials: a.trials,
        successes: a.successes,
        mean: a.trials ? a.successes / a.trials : 0,
        ci95: [q(0.025), q(0.975)] as [number, number],
        pBest: wins[a.variant] / iters,
      };
    });
  }

  toJSON(): ExperimentState { return this.state; }
  static fromJSON(s: ExperimentState): ExperimentEngine { return new ExperimentEngine(s); }

  async save(key: string): Promise<void> { await store.set(key, this.state); }
  static async load(key: string): Promise<ExperimentEngine> {
    const s = (await store.get<ExperimentState>(key)) ?? {};
    return new ExperimentEngine(s);
  }
}
