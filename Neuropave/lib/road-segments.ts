import type { XgboostFeatureInput } from '@/lib/xgboost-risk-predict';

export interface RoadSegment {
  id: string;
  name: string;
  health: number;
  trend: string;
  status: 'good' | 'warning' | 'critical';
  temp: number;
  vibration: number;
  strain: number;
  lastInspection: string;
}

export const roadSegments: RoadSegment[] = [
  { id: 'RD-001', name: 'NH-48 — Gurugram Expressway', health: 87, trend: 'up', status: 'good', temp: 42, vibration: 0.8, strain: 145, lastInspection: '2 days ago' },
  { id: 'RD-002', name: 'Ring Road — Dhaula Kuan Flyover', health: 64, trend: 'down', status: 'warning', temp: 38, vibration: 1.4, strain: 210, lastInspection: '5 days ago' },
  { id: 'RD-003', name: 'DND Flyway — Mayur Vihar', health: 42, trend: 'down', status: 'critical', temp: 35, vibration: 2.1, strain: 285, lastInspection: '1 day ago' },
  { id: 'RD-004', name: 'Noida–Greater Noida Expressway', health: 93, trend: 'up', status: 'good', temp: 40, vibration: 0.5, strain: 120, lastInspection: '4 days ago' },
  { id: 'RD-005', name: 'NH-44 — Panipat Stretch', health: 71, trend: 'flat', status: 'warning', temp: 31, vibration: 1.1, strain: 190, lastInspection: '3 days ago' },
  { id: 'RD-006', name: 'Yamuna Expressway — Jewar Section', health: 95, trend: 'up', status: 'good', temp: 39, vibration: 0.3, strain: 105, lastInspection: '1 day ago' },
];

/** Map dashboard road row → XGBoost feature vector (same units as manual form). */
export function segmentToFeatures(segment: RoadSegment): XgboostFeatureInput {
  const humidityPct =
    segment.status === 'critical' ? 78 : segment.status === 'warning' ? 65 : 52;
  const pavementAgeYears = Math.max(4, Math.min(32, Math.round(32 - segment.health * 0.28)));
  const trafficLoadIndex =
    segment.status === 'critical' ? 90 : segment.status === 'warning' ? 70 : 38;
  return {
    vibrationMms: segment.vibration,
    strainMicrostrain: segment.strain,
    tempC: segment.temp,
    humidityPct,
    pavementAgeYears,
    trafficLoadIndex,
  };
}
