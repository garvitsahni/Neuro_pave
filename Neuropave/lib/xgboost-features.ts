import type { XgboostFeatureInput } from '@/lib/xgboost-risk-predict';

/** Float32 vector for ONNX — same order as `scripts/train_xgboost_onnx.py`. */
export function rawFeaturesToTensor(raw: XgboostFeatureInput): Float32Array {
  return new Float32Array([
    raw.vibrationMms,
    raw.strainMicrostrain,
    raw.tempC,
    raw.humidityPct,
    raw.pavementAgeYears,
    raw.trafficLoadIndex,
  ]);
}
