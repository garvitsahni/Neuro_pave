'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';
import {
  Brain, AlertTriangle, TrendingDown, TrendingUp, Shield,
  Clock, Calendar, ChevronRight, Zap, Activity, Gauge,
  ArrowRight, Timer, MapPin, Layers, Construction,
} from 'lucide-react';

/* ─── types ──────────────────────────────────────────────────────────── */
interface DecayMilestone {
  dayOffset: number;
  label: string;
}

interface SegmentPrediction {
  id: string;
  name: string;
  status: string;
  backend: string;
  daysUntilDecay: number;
  estimatedDecayDate: string;
  failureRisk: number;
  decayMilestones: DecayMilestone[];
}

interface RoadDecayResponse {
  success: boolean;
  failuresNext30Days: number;
  soonestDecay: {
    days: number;
    date: string;
    segmentName: string;
    segmentId: string;
  } | null;
  segments: SegmentPrediction[];
  modelNote: string;
  timestamp: string;
}

/* ─── helpers ────────────────────────────────────────────────────────── */
const riskColor = (risk: number) =>
  risk >= 70 ? '#f43f5e' : risk >= 40 ? '#f59e0b' : '#22c55e';
const riskLabel = (risk: number) =>
  risk >= 70 ? 'Critical' : risk >= 40 ? 'Warning' : 'Healthy';
const riskBg = (risk: number) =>
  risk >= 70
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : risk >= 40
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

const daysUrgency = (d: number) =>
  d <= 7 ? '#f43f5e' : d <= 21 ? '#f59e0b' : d <= 45 ? '#3b82f6' : '#22c55e';

/* ─── page ───────────────────────────────────────────────────────────── */
export default function PredictionsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RoadDecayResponse | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<SegmentPrediction | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/road-decay');
        const json = await res.json();
        if (json.success) {
          setData(json);
          if (json.segments.length > 0) {
            // Select most critical one first
            const sorted = [...json.segments].sort(
              (a: SegmentPrediction, b: SegmentPrediction) => a.daysUntilDecay - b.daysUntilDecay
            );
            setSelectedSegment(sorted[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = useMemo(() => {
    if (!data) return { critical: 0, warning: 0, healthy: 0, avgDays: 0 };
    const segs = data.segments;
    const critical = segs.filter((s) => s.failureRisk >= 70).length;
    const warning = segs.filter((s) => s.failureRisk >= 40 && s.failureRisk < 70).length;
    const healthy = segs.filter((s) => s.failureRisk < 40).length;
    const avgDays = segs.length > 0
      ? Math.round(segs.reduce((a, s) => a + s.daysUntilDecay, 0) / segs.length)
      : 0;
    return { critical, warning, healthy, avgDays };
  }, [data]);

  const sortedSegments = useMemo(() => {
    if (!data) return [];
    return [...data.segments].sort((a, b) => a.daysUntilDecay - b.daysUntilDecay);
  }, [data]);

  // Chart data for the risk distribution bar chart
  const riskChartData = useMemo(() => {
    if (!data) return [];
    return data.segments.map((s) => ({
      name: s.id,
      risk: s.failureRisk,
      days: s.daysUntilDecay,
      fill: riskColor(s.failureRisk),
    }));
  }, [data]);

  // Radial chart for selected segment
  const radialData = useMemo(() => {
    if (!selectedSegment) return [];
    return [
      {
        name: 'Risk',
        value: selectedSegment.failureRisk,
        fill: riskColor(selectedSegment.failureRisk),
      },
    ];
  }, [selectedSegment]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050505]">
        <AppSidebar />
        <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex items-center justify-center">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 animate-pulse">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white/40 text-sm font-semibold">Running XGBoost Model...</p>
              <p className="text-white/20 text-xs mt-1">Analyzing road decay features across all segments</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />

      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* ─── HEADER ──────────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/[0.04] to-transparent border border-white/[0.06]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-indigo-500/15 border border-indigo-500/20 rounded-full flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">XGBoost Prediction Engine</span>
                </div>
                <div className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                    {data?.segments[0]?.backend === 'xgboost-onnx' ? 'ONNX Runtime' : 'Surrogate Model'}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                Pothole & Road Decay Predictions
              </h1>
              <p className="text-white/40 text-sm max-w-2xl font-medium leading-relaxed">
                XGBoost gradient boosted trees analyze 6 infrastructure features — vibration, strain, temperature, humidity,
                pavement age, and traffic load — to predict exactly how many days remain before potholes and structural
                failures appear on each road segment.
              </p>
            </div>
          </section>

          {/* ─── KPI ROW ─────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/[0.02] border border-white/[0.06] group hover:border-rose-500/20 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-bold">Critical Segments</p>
              </div>
              <p className="text-3xl font-extrabold text-rose-400 tabular-nums">{summary.critical}</p>
              <p className="text-xs text-white/30 mt-1">Potholes within 30 days</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02] border border-white/[0.06] group hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Construction className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-bold">At Risk</p>
              </div>
              <p className="text-3xl font-extrabold text-amber-400 tabular-nums">{summary.warning}</p>
              <p className="text-xs text-white/30 mt-1">Deteriorating condition</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02] border border-white/[0.06] group hover:border-emerald-500/20 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-bold">Healthy</p>
              </div>
              <p className="text-3xl font-extrabold text-emerald-400 tabular-nums">{summary.healthy}</p>
              <p className="text-xs text-white/30 mt-1">No potholes predicted</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/[0.02] border border-white/[0.06] group hover:border-indigo-500/20 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Timer className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-bold">Avg. Days Left</p>
              </div>
              <p className="text-3xl font-extrabold text-indigo-400 tabular-nums">{summary.avgDays}</p>
              <p className="text-xs text-white/30 mt-1">Mean time to failure</p>
            </div>
          </section>

          {/* ─── MAIN CONTENT: List + Details ────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            {/* LEFT: Segment Ranking (sorted by urgency) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-[0.12em]">
                  Pothole Countdown
                </h3>
                <span className="text-[10px] text-white/25 font-medium">sorted by urgency</span>
              </div>

              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {sortedSegments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 ${
                      selectedSegment?.id === seg.id
                        ? 'bg-white/[0.06] border-indigo-500/30 shadow-lg shadow-indigo-500/[0.05]'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/25">{seg.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${riskBg(seg.failureRisk)}`}>
                          {riskLabel(seg.failureRisk)}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-white/15 transition-all ${
                        selectedSegment?.id === seg.id ? 'text-indigo-400 translate-x-0.5' : 'group-hover:text-white/30'
                      }`} />
                    </div>

                    <p className="text-sm font-semibold text-white/75 mb-3 leading-snug">{seg.name}</p>

                    {/* Days countdown bar */}
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0 text-center">
                        <div
                          className="w-14 h-14 rounded-xl flex flex-col items-center justify-center border"
                          style={{
                            backgroundColor: daysUrgency(seg.daysUntilDecay) + '12',
                            borderColor: daysUrgency(seg.daysUntilDecay) + '30',
                          }}
                        >
                          <span
                            className="text-lg font-black tabular-nums leading-none"
                            style={{ color: daysUrgency(seg.daysUntilDecay) }}
                          >
                            {seg.daysUntilDecay}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-white/30 mt-0.5">days</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-white/30 font-medium">Failure Risk</span>
                          <span className="font-bold tabular-nums" style={{ color: riskColor(seg.failureRisk) }}>
                            {seg.failureRisk}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${seg.failureRisk}%`,
                              backgroundColor: riskColor(seg.failureRisk),
                              boxShadow: `0 0 8px ${riskColor(seg.failureRisk)}40`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-white/20">
                          <Calendar className="w-3 h-3 inline mr-1 -mt-0.5" />
                          Pothole by {seg.estimatedDecayDate}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Selected Segment Analysis */}
            <div className="space-y-5">
              {selectedSegment && (
                <>
                  {/* Detail Header */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-white/25">{selectedSegment.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${riskBg(selectedSegment.failureRisk)}`}>
                            {riskLabel(selectedSegment.failureRisk)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                            XGBoost
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white/90 tracking-tight">{selectedSegment.name}</h3>
                      </div>

                      {/* Big countdown */}
                      <div className="text-right">
                        <p
                          className="text-5xl font-black tabular-nums leading-none"
                          style={{
                            color: daysUrgency(selectedSegment.daysUntilDecay),
                            textShadow: `0 0 30px ${daysUrgency(selectedSegment.daysUntilDecay)}30`,
                          }}
                        >
                          {selectedSegment.daysUntilDecay}
                        </p>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider font-bold mt-1">Days Until Pothole</p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Failure Risk', value: `${selectedSegment.failureRisk}%`, icon: <Gauge className="w-3.5 h-3.5" />, color: riskColor(selectedSegment.failureRisk) },
                        { label: 'Est. Pothole Date', value: selectedSegment.estimatedDecayDate, icon: <Calendar className="w-3.5 h-3.5" />, color: '#6366f1' },
                        { label: 'Model Backend', value: selectedSegment.backend === 'xgboost-onnx' ? 'XGBoost ONNX' : 'XGBoost Surrogate', icon: <Brain className="w-3.5 h-3.5" />, color: '#8b5cf6' },
                      ].map(({ label, value, icon, color }) => (
                        <div key={label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div style={{ color }}>{icon}</div>
                            <span className="text-[9px] text-white/25 uppercase tracking-wider font-bold">{label}</span>
                          </div>
                          <p className="text-sm font-bold text-white/70 tabular-nums">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decay Timeline */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <Activity className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white/80">XGBoost Decay Timeline</h4>
                        <p className="text-[10px] text-white/25">Predicted structural progression to pothole formation</p>
                      </div>
                    </div>

                    <div className="relative pl-6">
                      {/* Vertical line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/40 via-amber-500/40 to-rose-500/40" />

                      <div className="space-y-5">
                        {selectedSegment.decayMilestones.map((milestone, i) => {
                          const total = selectedSegment.decayMilestones.length - 1;
                          const progress = total > 0 ? i / total : 0;
                          const dotColor = progress < 0.3 ? '#22c55e' : progress < 0.7 ? '#f59e0b' : '#f43f5e';
                          const isLast = i === total;

                          return (
                            <div key={i} className="relative flex items-start gap-4">
                              {/* Dot */}
                              <div
                                className={`absolute -left-6 top-1 w-[11px] h-[11px] rounded-full border-2 flex-shrink-0 ${isLast ? 'animate-pulse' : ''}`}
                                style={{
                                  backgroundColor: dotColor + '30',
                                  borderColor: dotColor,
                                  boxShadow: `0 0 8px ${dotColor}40`,
                                }}
                              />

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold tabular-nums" style={{ color: dotColor }}>
                                    Day {milestone.dayOffset}
                                  </span>
                                  {isLast && (
                                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded">
                                      Pothole
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed">{milestone.label}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Risk Distribution Chart */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <Layers className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white/80">Failure Risk Across All Segments</h4>
                        <p className="text-[10px] text-white/25">XGBoost predicted risk scores (%) — higher = sooner pothole</p>
                      </div>
                    </div>

                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={riskChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.08)"
                            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.08)"
                            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
                            tickLine={false}
                            domain={[0, 100]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(10,12,30,0.95)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 12,
                              fontSize: 11,
                              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            }}
                            formatter={(value: number, name: string) => {
                              if (name === 'risk') return [`${value}%`, 'Failure Risk'];
                              return [`${value} days`, 'Days Until Pothole'];
                            }}
                          />
                          <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
                            {riskChartData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ─── SOONEST DECAY ALERT ─────────────────────────────────── */}
          {data?.soonestDecay && (
            <section className="p-6 rounded-2xl bg-gradient-to-r from-rose-500/[0.06] to-transparent border border-rose-500/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white/80">
                    ⚠ Nearest Predicted Pothole: <span className="text-rose-400">{data.soonestDecay.segmentName}</span>
                  </p>
                  <p className="text-xs text-white/35 mt-0.5">
                    XGBoost predicts road surface failure in <strong className="text-rose-300">{data.soonestDecay.days} days</strong> (by {data.soonestDecay.date}).
                    Schedule preventive maintenance now to avoid costly emergency repairs.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-rose-400 tabular-nums">{data.soonestDecay.days}d</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-wider font-bold">Until Pothole</p>
                </div>
              </div>
            </section>
          )}

          {/* ─── MODEL INFO FOOTER ───────────────────────────────────── */}
          <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/80">XGBoost Model Details</p>
              <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                {data?.modelNote ?? 'Loading...'} Features: vibration (mm/s), strain (µε), temperature (°C),
                humidity (%), pavement age (years), traffic load index. The model predicts days until
                major road surface failure (pothole formation).
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
