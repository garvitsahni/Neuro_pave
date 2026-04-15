import { addDaysISO, buildDecayTimeline, riskFromDecayDays } from '@/lib/decay-timeline';
import { predictDecayDaysOnnx } from '@/lib/run-xgboost-onnx';
import {
  predictInfrastructureFailureRisk,
  type RiskStatus,
  type XgboostFeatureInput,
  type XgboostPredictionResult,
} from '@/lib/xgboost-risk-predict';

export async function runXgboostPrediction(input: XgboostFeatureInput): Promise<{
  prediction: XgboostPredictionResult;
  backend: 'xgboost-onnx' | 'surrogate';
}> {
  const surrogate = predictInfrastructureFailureRisk(input);
  const base: XgboostPredictionResult = {
    ...surrogate,
    daysUntilDecay: surrogate.horizonDays,
    estimatedDecayDate: addDaysISO(new Date(), surrogate.horizonDays),
    decayMilestones: buildDecayTimeline(surrogate.horizonDays),
  };

  const onnxDays = await predictDecayDaysOnnx(input);
  if (onnxDays == null) {
    return { prediction: base, backend: 'surrogate' };
  }

  const failureRisk = riskFromDecayDays(onnxDays);
  const status: RiskStatus =
    failureRisk >= 70 ? 'critical' : failureRisk >= 40 ? 'warning' : 'healthy';

  return {
    backend: 'xgboost-onnx',
    prediction: {
      ...base,
      failureRisk,
      horizonDays: onnxDays,
      daysUntilDecay: onnxDays,
      estimatedDecayDate: addDaysISO(new Date(), onnxDays),
      decayMilestones: buildDecayTimeline(onnxDays),
      status,
    },
  };
}
