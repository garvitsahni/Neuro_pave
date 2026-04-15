"""
Train an XGBoost regressor for days-to-road-decay and export ONNX for NeuroPave.

Requires: pip install numpy xgboost onnxmltools onnx

Run:
  python Neuropave/scripts/train_xgboost_onnx.py
"""

from __future__ import annotations

import os
import sys

import numpy as np

try:
    from xgboost import XGBRegressor
    import onnxmltools
    from onnxmltools.convert.common.data_types import FloatTensorType
except ImportError as e:
    print("Install deps: pip install numpy xgboost onnxmltools onnx", file=sys.stderr)
    raise e

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "models", "road_decay_xgb.onnx")


def synthetic_days(X: np.ndarray) -> np.ndarray:
    """Nonlinear 'days until structural failure' in [5, 365]."""
    v, s, t, h, a, tr = X[:, 0], X[:, 1], X[:, 2], X[:, 3], X[:, 4], X[:, 5]
    stress = (
        0.32 * (v / 3.2) ** 1.8
        + 0.28 * (s / 320.0) ** 1.6
        + 0.14 * np.abs(t - 20.0) / 40.0
        + 0.1 * (h / 100.0) ** 1.2
        + 0.1 * (a / 35.0) ** 1.3
        + 0.06 * (tr / 100.0) ** 1.4
    )
    days = 130.0 - 118.0 * np.clip(stress, 0, 1.2) + np.random.randn(len(X)) * 6.0
    return np.clip(days, 5.0, 365.0)


def main() -> None:
    np.random.seed(42)
    n = 10_000
    X = np.column_stack(
        [
            np.random.uniform(0.2, 3.2, n),
            np.random.uniform(80, 320, n),
            np.random.uniform(-5, 55, n),
            np.random.uniform(15, 98, n),
            np.random.uniform(2, 35, n),
            np.random.uniform(8, 98, n),
        ]
    ).astype(np.float32)
    y = synthetic_days(X).astype(np.float32)

    model = XGBRegressor(
        n_estimators=140,
        max_depth=6,
        learning_rate=0.07,
        subsample=0.88,
        colsample_bytree=0.85,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    initial_types = [("float_input", FloatTensorType([None, 6]))]
    onnx_model = onnxmltools.convert_xgboost(
        model,
        initial_types=initial_types,
        target_opset=12,
        doc_string="road decay days regressor",
    )
    with open(OUT, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"Wrote {OUT} ({os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    main()
