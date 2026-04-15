export interface DecayMilestone {
  dayOffset: number;
  label: string;
}

/** Calendar phases leading up to the model’s predicted failure horizon (days from today). */
export function buildDecayTimeline(daysToDecay: number): DecayMilestone[] {
  const d = Math.max(1, Math.round(daysToDecay));
  const q = (p: number) => Math.max(0, Math.min(d, Math.round(d * p)));
  return [
    { dayOffset: 0, label: 'Baseline — current structural response' },
    { dayOffset: q(0.22), label: 'Surface wear accelerates (micro-cracking)' },
    { dayOffset: q(0.45), label: 'Strain & vibration coupling increases' },
    { dayOffset: q(0.68), label: 'Structural decay zone — inspection priority' },
    { dayOffset: q(0.88), label: 'Critical threshold approaching' },
    { dayOffset: d, label: 'Predicted failure / major intervention window' },
  ];
}

export function addDaysISO(base: Date, days: number): string {
  const t = new Date(base);
  t.setDate(t.getDate() + Math.round(days));
  return t.toISOString().slice(0, 10);
}

/** Higher risk when fewer days remain until decay. */
export function riskFromDecayDays(days: number): number {
  const d = Math.max(3, Math.min(365, days));
  return Math.round(5 + 90 * (1 - (d - 3) / (365 - 3)));
}
