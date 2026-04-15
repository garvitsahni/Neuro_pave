import * as fs from 'fs';
import * as path from 'path';
import type { XgboostFeatureInput } from '@/lib/xgboost-risk-predict';
import { rawFeaturesToTensor } from '@/lib/xgboost-features';

const MODEL_REL = path.join('models', 'road_decay_xgb.onnx');

let sessionPromise: any | null = null;

function modelPath(): string {
  return path.join(process.cwd(), MODEL_REL);
}

export function isOnnxModelPresent(): boolean {
  try {
    return fs.existsSync(modelPath());
  } catch {
    return false;
  }
}

/** Predicted whole days until major decay / failure threshold (XGBoost → ONNX). */
export async function predictDecayDaysOnnx(raw: XgboostFeatureInput): Promise<number | null> {
  if (!isOnnxModelPresent()) return null;

  try {
    const ort = await import(/* webpackIgnore: true */ 'onnxruntime-node');
    if (!sessionPromise) {
      sessionPromise = ort.InferenceSession.create(modelPath());
    }
    const session = await sessionPromise;
    const inputName = session.inputNames[0];
    const data = rawFeaturesToTensor(raw);
    const tensor = new ort.Tensor('float32', data, [1, 6]);
    const results = await session.run({ [inputName]: tensor });
    const outName = session.outputNames[0];
    const arr = results[outName].data as Float32Array;
    const v = Number(arr[0]);
    if (!Number.isFinite(v)) return null;
    return Math.round(Math.min(365, Math.max(3, v)));
  } catch {
    // onnxruntime-node not installed — graceful fallback
    return null;
  }
}
