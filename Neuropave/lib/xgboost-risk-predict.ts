/**
 * Fallback heuristic when no ONNX export is present. Primary path: XGBoost → ONNX in
 * `run-xgboost-onnx.ts` (train with `scripts/train_xgboost_onnx.py`).
 */

import { addDaysISO, buildDecayTimeline } from '@/lib/decay-timeline';

export interface XgboostFeatureInput {
  vibrationMms: number;
  strainMicrostrain: number;
  tempC: number;
  humidityPct: number;
  pavementAgeYears: number;
  trafficLoadIndex: number;
}

export type RiskStatus = 'healthy' | 'warning' | 'critical';

export interface XgboostPredictionResult {
  failureRisk: number;
  horizonDays: number;
  /** Same as horizonDays when using the unified API — days until predicted decay window. */
  daysUntilDecay: number;
  /** ISO calendar date (YYYY-MM-DD) for estimated major decay / failure. */
  estimatedDecayDate: string;
  decayMilestones: { dayOffset: number; label: string }[];
  status: RiskStatus;
  featureContributions: { feature: string; impact: number }[];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Piecewise score mimicking shallow boosted trees on normalized features. */
export function predictInfrastructureFailureRisk(
  raw: XgboostFeatureInput,
): XgboostPredictionResult {
  const contributions: { feature: string; impact: number }[] = [];

  let score = 12;

  const vib = raw.vibrationMms;
  let vibImpact = 0;
  if (vib >= 2.2) vibImpact = 28;
  else if (vib >= 1.5) vibImpact = 18;
  else if (vib >= 1.0) vibImpact = 10;
  else if (vib >= 0.6) vibImpact = 4;
  score += vibImpact;
  contributions.push({ feature: 'Vibration (mm/s)', impact: vibImpact });

  const strain = raw.strainMicrostrain;
  let strainImpact = 0;
  if (strain >= 280) strainImpact = 26;
  else if (strain >= 220) strainImpact = 16;
  else if (strain >= 170) strainImpact = 8;
  else if (strain >= 130) strainImpact = 3;
  score += strainImpact;
  contributions.push({ feature: 'Strain (µε)', impact: strainImpact });

  const temp = raw.tempC;
  let tempImpact = 0;
  if (temp >= 48 || temp <= -5) tempImpact = 14;
  else if (temp >= 42 || temp <= 0) tempImpact = 8;
  else if (temp >= 38) tempImpact = 4;
  score += tempImpact;
  contributions.push({ feature: 'Temperature (°C)', impact: tempImpact });

  const hum = raw.humidityPct;
  let humImpact = 0;
  if (hum >= 92) humImpact = 10;
  else if (hum >= 85) humImpact = 6;
  else if (hum >= 78) humImpact = 3;
  score += humImpact;
  contributions.push({ feature: 'Humidity (%)', impact: humImpact });

  const age = raw.pavementAgeYears;
  let ageImpact = 0;
  if (age >= 28) ageImpact = 14;
  else if (age >= 18) ageImpact = 9;
  else if (age >= 12) ageImpact = 5;
  else if (age >= 8) ageImpact = 2;
  score += ageImpact;
  contributions.push({ feature: 'Pavement age (y)', impact: ageImpact });

  const traffic = raw.trafficLoadIndex;
  let trafficImpact = 0;
  if (traffic >= 88) trafficImpact = 16;
  else if (traffic >= 72) trafficImpact = 11;
  else if (traffic >= 55) trafficImpact = 6;
  else if (traffic >= 40) trafficImpact = 2;
  score += trafficImpact;
  contributions.push({ feature: 'Traffic load index', impact: trafficImpact });

  const failureRisk = Math.round(clamp(score, 5, 96));
  const horizonDays = Math.max(3, Math.round(52 - failureRisk * 0.42));

  const status: RiskStatus =
    failureRisk >= 70 ? 'critical' : failureRisk >= 40 ? 'warning' : 'healthy';

  return {
    failureRisk,
    horizonDays,
    daysUntilDecay: horizonDays,
    estimatedDecayDate: addDaysISO(new Date(), horizonDays),
    decayMilestones: buildDecayTimeline(horizonDays),
    status,
    featureContributions: contributions,
  };
}
