import { roadSegments, segmentToFeatures } from '@/lib/road-segments';
import { runXgboostPrediction } from '@/lib/xgboost-prediction-merge';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await Promise.all(
      roadSegments.map(async (seg) => {
        const input = segmentToFeatures(seg);
        const { prediction, backend } = await runXgboostPrediction(input);
        return {
          id: seg.id,
          name: seg.name,
          status: seg.status,
          backend,
          daysUntilDecay: prediction.daysUntilDecay,
          estimatedDecayDate: prediction.estimatedDecayDate,
          failureRisk: prediction.failureRisk,
          decayMilestones: prediction.decayMilestones,
        };
      }),
    );

    const failuresNext30Days = results.filter((r) => r.daysUntilDecay <= 30).length;
    const sorted = [...results].sort((a, b) => a.daysUntilDecay - b.daysUntilDecay);
    const soonest = sorted[0];

    return Response.json({
      success: true,
      failuresNext30Days,
      soonestDecay: soonest
        ? {
            days: soonest.daysUntilDecay,
            date: soonest.estimatedDecayDate,
            segmentName: soonest.name,
            segmentId: soonest.id,
          }
        : null,
      segments: results,
      modelNote:
        'Primary: XGBoost regressor exported to ONNX (models/road_decay_xgb.onnx). Falls back to heuristic if file missing.',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return Response.json({ success: false, error: 'Road decay forecast failed' }, { status: 500 });
  }
}
