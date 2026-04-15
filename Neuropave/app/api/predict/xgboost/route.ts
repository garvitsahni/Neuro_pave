import type { XgboostFeatureInput } from '@/lib/xgboost-risk-predict';
import { runXgboostPrediction } from '@/lib/xgboost-prediction-merge';

export const dynamic = 'force-dynamic';

function parseNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const input: XgboostFeatureInput = {
      vibrationMms: parseNum(body.vibrationMms, 1.0),
      strainMicrostrain: parseNum(body.strainMicrostrain, 180),
      tempC: parseNum(body.tempC, 35),
      humidityPct: parseNum(body.humidityPct, 55),
      pavementAgeYears: parseNum(body.pavementAgeYears, 12),
      trafficLoadIndex: parseNum(body.trafficLoadIndex, 50),
    };

    if (input.humidityPct < 0 || input.humidityPct > 100) {
      return Response.json(
        { success: false, error: 'humidityPct must be between 0 and 100' },
        { status: 400 },
      );
    }
    if (input.trafficLoadIndex < 0 || input.trafficLoadIndex > 100) {
      return Response.json(
        { success: false, error: 'trafficLoadIndex must be between 0 and 100' },
        { status: 400 },
      );
    }

    const { prediction, backend } = await runXgboostPrediction(input);

    return Response.json({
      success: true,
      model: backend === 'xgboost-onnx' ? 'xgboost-onnx-road-decay' : 'surrogate-fallback',
      backend,
      input,
      prediction,
      note:
        backend === 'xgboost-onnx'
          ? 'XGBoost regressor (ONNX: models/road_decay_xgb.onnx).'
          : 'ONNX not found — using heuristic in lib/xgboost-risk-predict.ts. Run scripts/train_xgboost_onnx.py.',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { success: false, error: 'Invalid prediction request' },
      { status: 500 },
    );
  }
}
