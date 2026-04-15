"""
NeuroPave — XGBoost Road Decay Prediction Model Training Script
===============================================================
Trains an XGBoost regressor on synthetic road-sensor data and exports it
to ONNX format for use in the Next.js app via onnxruntime-node.

Features (6 inputs):
  1. vibration_mms       — vibration intensity (mm/s)
  2. strain_microstrain  — structural strain (µε)
  3. temp_c              — surface temperature (°C)
  4. humidity_pct        — humidity (%)
  5. pavement_age_years  — pavement age (years)
  6. traffic_load_index  — traffic load index (0-100)

Target:
  days_until_decay — days until significant road decay / pothole formation

Requirements:
  pip install xgboost scikit-learn numpy onnxmltools skl2onnx
"""

import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import os

# ── Reproducibility ────────────────────────────────────────────────────────────
np.random.seed(42)
N = 10_000  # synthetic samples

# ── Synthetic Feature Generation ───────────────────────────────────────────────
vibration       = np.random.uniform(0.1, 3.5, N)      # mm/s
strain          = np.random.uniform(80, 350, N)        # µε
temp            = np.random.uniform(-10, 55, N)        # °C
humidity        = np.random.uniform(20, 98, N)         # %
pavement_age    = np.random.uniform(1, 35, N)          # years
traffic_load    = np.random.uniform(5, 100, N)         # index 0-100

X = np.column_stack([
    vibration, strain, temp, humidity, pavement_age, traffic_load
])

# ── Synthetic Target Engineering ───────────────────────────────────────────────
# Mirrors the domain knowledge in xgboost-risk-predict.ts
# but adds noise and interactions to make it a realistic regression target.

def compute_days(vib, strain, temp, hum, age, traffic):
    risk = 12.0

    # Vibration contribution
    risk += np.where(vib >= 2.2, 28, np.where(vib >= 1.5, 18,
            np.where(vib >= 1.0, 10, np.where(vib >= 0.6, 4, 0))))

    # Strain contribution
    risk += np.where(strain >= 280, 26, np.where(strain >= 220, 16,
            np.where(strain >= 170, 8, np.where(strain >= 130, 3, 0))))

    # Temperature contribution (extreme hot or cold)
    risk += np.where((temp >= 48) | (temp <= -5), 14,
            np.where((temp >= 42) | (temp <= 0), 8,
            np.where(temp >= 38, 4, 0)))

    # Humidity contribution
    risk += np.where(hum >= 92, 10, np.where(hum >= 85, 6,
            np.where(hum >= 78, 3, 0)))

    # Age contribution
    risk += np.where(age >= 28, 14, np.where(age >= 18, 9,
            np.where(age >= 12, 5, np.where(age >= 8, 2, 0))))

    # Traffic contribution
    risk += np.where(traffic >= 88, 16, np.where(traffic >= 72, 11,
            np.where(traffic >= 55, 6, np.where(traffic >= 40, 2, 0))))

    # Interaction: high vibration + high age = faster decay
    risk += np.where((vib >= 1.5) & (age >= 15), 8, 0)

    risk = np.clip(risk, 5, 96)
    days = np.maximum(3, 52 - risk * 0.42)
    
    # Add realistic noise (±15% variance)
    noise = np.random.normal(1.0, 0.15, len(vib))
    days = days * noise
    return np.clip(days, 3, 365).astype(np.float32)

y = compute_days(vibration, strain, temp, humidity, pavement_age, traffic_load)

print(f"Dataset: {N} samples")
print(f"Target — Days until decay: min={y.min():.1f}, max={y.max():.1f}, mean={y.mean():.1f}")

# ── Train / Test Split ─────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── XGBoost Training ───────────────────────────────────────────────────────────
model = xgb.XGBRegressor(
    n_estimators=400,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=3,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    tree_method='hist',
)

print("\nTraining XGBoost model...")
model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    verbose=100,
)

# ── Evaluation ─────────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2  = r2_score(y_test, y_pred)
print(f"\nTest MAE:  {mae:.2f} days")
print(f"Test R²:   {r2:.4f}")

# ── Feature Importances ────────────────────────────────────────────────────────
feature_names = [
    'vibration_mms', 'strain_microstrain', 'temp_c',
    'humidity_pct', 'pavement_age_years', 'traffic_load_index'
]
importances = model.feature_importances_
print("\nFeature Importances:")
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"  {name:28s}: {imp:.4f}")

# ── ONNX Export ────────────────────────────────────────────────────────────────
output_dir = os.path.join(os.path.dirname(__file__), '..', 'Neuropave', 'models')
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, 'road_decay_xgb.onnx')

try:
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType
    from skl2onnx.helpers.onnx_helper import select_model_inputs_outputs
    import onnxmltools
    from onnxmltools.convert import convert_xgboost

    # Convert XGBoost → ONNX via onnxmltools
    initial_types = [('float_input', FloatTensorType([None, 6]))]
    onnx_model = convert_xgboost(model, initial_types=initial_types)

    with open(output_path, 'wb') as f:
        f.write(onnx_model.SerializeToString())

    print(f"\n✅ ONNX model saved → {output_path}")
    print("   The Next.js app will automatically use it via onnxruntime-node.")

except ImportError:
    # Fallback: use xgboost's built-in ONNX export (XGBoost >= 1.7)
    try:
        model.save_model(output_path)
        print(f"\n✅ XGBoost native model saved → {output_path}")
        print("   Note: For ONNX format, install: pip install onnxmltools skl2onnx")
    except Exception as e:
        print(f"\n⚠️  Could not export ONNX: {e}")
        print("   Install: pip install onnxmltools skl2onnx")

# ── Save feature names for reference ──────────────────────────────────────────
info_path = os.path.join(output_dir, 'model_info.txt')
with open(info_path, 'w') as f:
    f.write("NeuroPave XGBoost Road Decay Model\n")
    f.write("===================================\n")
    f.write(f"Training samples: {N}\n")
    f.write(f"Test MAE: {mae:.2f} days\n")
    f.write(f"Test R2:  {r2:.4f}\n\n")
    f.write("Input features (in order):\n")
    for i, name in enumerate(feature_names):
        f.write(f"  [{i}] {name}\n")
    f.write("\nOutput: days until road decay (float32)\n")

print(f"   Model info saved → {info_path}")
print("\nTo use the ONNX model in the app:")
print("  1. Ensure onnxruntime-node is installed: npm install onnxruntime-node")
print("  2. Restart the dev server: npm run dev")
print("  3. The /api/dashboard/road-decay endpoint will use the ONNX model.")
