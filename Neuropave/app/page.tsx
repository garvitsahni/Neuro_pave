'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Sensor, Alert } from '@/lib/mock-data';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { SensorMap } from '@/components/sensor-map';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ShieldCheck, TrendingUp, Radio, Leaf, ArrowUpRight, ArrowDownRight,
  Zap, Thermometer, Droplets, Layers, ChevronRight, Eye, Clock,
  AlertTriangle, Activity, Gauge, MapPin,
} from 'lucide-react';

interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
}

// Generate sparkline data
const genSparkline = (seed: number, n = 20) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: 40 + Math.sin(i * 0.6 + seed) * 20 + Math.cos(i * 0.3 + seed * 2) * 10 + (Math.sin(seed * 7 + i) * 5),
  }));

// Road segments mock data
const roadSegments = [
  { id: 'RD-001', name: 'US-101 North — Mile 5-12', health: 87, trend: 'up', status: 'good', temp: 42, vibration: 0.8, strain: 145, lastInspection: '2 days ago' },
  { id: 'RD-002', name: 'I-280 Junction — Bridge Approach', health: 64, trend: 'down', status: 'warning', temp: 38, vibration: 1.4, strain: 210, lastInspection: '5 days ago' },
  { id: 'RD-003', name: 'Bay Bridge — Deck Section A', health: 42, trend: 'down', status: 'critical', temp: 35, vibration: 2.1, strain: 285, lastInspection: '1 day ago' },
  { id: 'RD-004', name: 'Route 1 — Downtown Corridor', health: 93, trend: 'up', status: 'good', temp: 40, vibration: 0.5, strain: 120, lastInspection: '4 days ago' },
  { id: 'RD-005', name: 'I-680 — Mountain Pass Section', health: 71, trend: 'flat', status: 'warning', temp: 31, vibration: 1.1, strain: 190, lastInspection: '3 days ago' },
  { id: 'RD-006', name: 'Highway 101 — Mile 25-30', health: 95, trend: 'up', status: 'good', temp: 39, vibration: 0.3, strain: 105, lastInspection: '1 day ago' },
];

// Carbon data
const carbonData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  saved: 12 + Math.sin(i * 0.8) * 8 + i * 1.5,
  baseline: 28 + Math.sin(i * 0.5) * 5,
}));

// Prediction data
const predictionData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  actual: i < 20 ? 85 - Math.sin(i * 0.3) * 12 - i * 0.3 : undefined,
  predicted: 85 - Math.sin(i * 0.3) * 12 - i * 0.3 + Math.sin(i * 0.7) * 3,
  confidence: 85 - Math.sin(i * 0.3) * 12 - i * 0.3 + 8,
  confidenceLow: 85 - Math.sin(i * 0.3) * 12 - i * 0.3 - 8,
}));

export default function Dashboard() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<Record<string, SensorReading>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoad, setSelectedRoad] = useState(roadSegments[0]);
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'risk' | 'environment'>('overview');
  const [carbonDelay, setCarbonDelay] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, alertsRes] = await Promise.all([
          fetch('/api/sensors'),
          fetch('/api/alerts'),
        ]);
        const sensorsData = await sensorsRes.json();
        const alertsData = await alertsRes.json();
        setSensors(sensorsData.data.map((s: any) => ({ ...s, lastUpdate: new Date(s.lastUpdate) })));
        setAlerts(alertsData.data);

        const readingsMap: Record<string, SensorReading> = {};
        await Promise.all(
          sensorsData.data.map(async (sensor: any) => {
            try {
              const readingRes = await fetch(`/api/sensors/${sensor.id}/readings`);
              const readingData = await readingRes.json();
              if (readingData.success && readingData.data.readings.length > 0) {
                const lastReading = readingData.data.readings[readingData.data.readings.length - 1];
                readingsMap[sensor.id] = { sensorId: sensor.id, value: lastReading.value, unit: lastReading.unit };
              }
            } catch {}
          })
        );
        setReadings(readingsMap);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  const warningAlerts = alerts.filter((a) => a.severity === 'warning').length;
  const activeSensors = sensors.filter((s) => s.status !== 'offline').length;

  const statusColor = (s: string) =>
    s === 'good' ? '#22c55e' : s === 'warning' ? '#f59e0b' : '#f43f5e';
  const statusBg = (s: string) =>
    s === 'good' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    s === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
    'bg-rose-500/10 text-rose-400 border-rose-500/20';

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050505]">
        <AppSidebar />
        <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex items-center justify-center">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-pulse">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <p className="text-white/30 text-sm font-medium">Initializing NeuroPave AI...</p>
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
          {/* ===================== HERO SECTION ===================== */}
          <section className="relative overflow-hidden rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(245,158,11,0.04) 50%, rgba(59,130,246,0.06) 100%)' }}>
            {/* Ambient circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Live System</span>
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">AI Road Health Intelligence</h2>
              <p className="text-sm text-white/35 font-medium max-w-md">Predicting infrastructure failures before they happen — powered by real-time sensor fusion and machine learning.</p>
            </div>
          </section>

          {/* ===================== KPI CARDS ===================== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {[
              {
                label: 'AI Risk Score',
                value: '23.4%',
                sub: 'Low Risk',
                trend: '-4.2%',
                trendUp: false,
                color: '#22c55e',
                gradient: 'from-emerald-500/10 to-emerald-500/[0.02]',
                icon: <ShieldCheck className="w-5 h-5" />,
                sparkSeed: 1,
              },
              {
                label: 'Roads Monitored',
                value: sensors.length > 0 ? '847' : '---',
                sub: `${activeSensors} sensors online`,
                trend: '+12',
                trendUp: true,
                color: '#6366f1',
                gradient: 'from-emerald-500/10 to-emerald-500/[0.02]',
                icon: <Radio className="w-5 h-5" />,
                sparkSeed: 2,
              },
              {
                label: 'Predicted Failures',
                value: '12',
                sub: 'Next 30 days',
                trend: '-3',
                trendUp: false,
                color: '#f59e0b',
                gradient: 'from-amber-500/10 to-amber-500/[0.02]',
                icon: <AlertTriangle className="w-5 h-5" />,
                sparkSeed: 3,
              },
              {
                label: 'CO₂ Saved',
                value: '142t',
                sub: 'This quarter',
                trend: '+18.5%',
                trendUp: true,
                color: '#22c55e',
                gradient: 'from-emerald-500/10 to-emerald-500/[0.02]',
                icon: <Leaf className="w-5 h-5" />,
                sparkSeed: 4,
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`group relative p-5 rounded-2xl bg-gradient-to-br ${kpi.gradient} border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 overflow-hidden`}
              >
                {/* Ambient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl border border-white/[0.06]" style={{ backgroundColor: kpi.color + '12', color: kpi.color }}>
                      {kpi.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-[11px] font-bold ${kpi.trendUp ? 'text-emerald-400' : 'text-emerald-400'}`} style={{ color: kpi.color }}>
                      {kpi.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {kpi.trend}
                    </div>
                  </div>

                  <p className="text-3xl font-extrabold text-white tracking-tight tabular-nums mb-0.5 animate-count-up">{kpi.value}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-bold mb-0.5">{kpi.label}</p>
                  <p className="text-xs text-white/35">{kpi.sub}</p>

                  {/* Mini sparkline */}
                  <div className="mt-3 h-8 opacity-50 group-hover:opacity-80 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={genSparkline(kpi.sparkSeed)}>
                        <defs>
                          <linearGradient id={`kpi-${kpi.sparkSeed}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={kpi.color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="y" stroke={kpi.color} strokeWidth={1.5} fill={`url(#kpi-${kpi.sparkSeed})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* ===================== ROAD HEALTH + ANALYTICS ===================== */}
          <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            {/* Road Health Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-[0.12em]">Road Segments</h3>
                <span className="text-[10px] text-white/25 font-medium">{roadSegments.length} monitored</span>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {roadSegments.map((road) => (
                  <button
                    key={road.id}
                    onClick={() => setSelectedRoad(road)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 ${
                      selectedRoad.id === road.id
                        ? 'bg-white/[0.06] border-emerald-500/30 shadow-lg shadow-emerald-500/[0.05]'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/25">{road.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusBg(road.status)}`}>
                          {road.status}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-white/15 transition-all ${selectedRoad.id === road.id ? 'text-emerald-400 translate-x-0.5' : 'group-hover:text-white/30'}`} />
                    </div>
                    <p className="text-sm font-semibold text-white/75 mb-2.5 leading-snug">{road.name}</p>
                    <div className="flex items-center gap-3">
                      {/* Health score with ring */}
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke={statusColor(road.status)}
                            strokeWidth="3"
                            strokeDasharray={`${road.health * 0.94} 100`}
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 4px ${statusColor(road.status)}40)` }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-white/80 tabular-nums">{road.health}</span>
                      </div>
                      {/* Mini chart */}
                      <div className="flex-1 h-7 opacity-50 group-hover:opacity-80 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={genSparkline(road.id.charCodeAt(3), 15)}>
                            <Line type="monotone" dataKey="y" stroke={statusColor(road.status)} strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analytics Panel */}
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit">
                {(['overview', 'risk', 'environment'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAnalyticsTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                      analyticsTab === tab
                        ? 'bg-white/[0.08] text-white shadow-sm'
                        : 'text-white/35 hover:text-white/55 hover:bg-white/[0.03]'
                    }`}
                  >
                    {tab === 'environment' ? 'Environmental Impact' : tab === 'risk' ? 'Risk Analysis' : tab}
                  </button>
                ))}
              </div>

              {/* Selected Road Details */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-white/25">{selectedRoad.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusBg(selectedRoad.status)}`}>
                        {selectedRoad.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white/90 tracking-tight">{selectedRoad.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold tabular-nums" style={{ color: statusColor(selectedRoad.status), textShadow: `0 0 20px ${statusColor(selectedRoad.status)}25` }}>
                      {selectedRoad.health}%
                    </p>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider font-bold">Health Score</p>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Temperature', value: `${selectedRoad.temp}°C`, icon: <Thermometer className="w-3.5 h-3.5" />, color: '#f59e0b' },
                    { label: 'Vibration', value: `${selectedRoad.vibration} m/s²`, icon: <Layers className="w-3.5 h-3.5" />, color: '#3b82f6' },
                    { label: 'Strain', value: `${selectedRoad.strain} µε`, icon: <Zap className="w-3.5 h-3.5" />, color: '#22c55e' },
                    { label: 'Last Check', value: selectedRoad.lastInspection, icon: <Clock className="w-3.5 h-3.5" />, color: '#8b5cf6' },
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

                {/* Chart */}
                {analyticsTab === 'overview' && (
                  <div className="h-64">
                    <p className="text-[10px] uppercase tracking-wider text-white/20 font-bold mb-3">AI Prediction Model — 30 Day Forecast</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={predictionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.06} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickLine={false} domain={[40, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(10,12,30,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 11, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
                        />
                        <Area type="monotone" dataKey="confidence" stroke="none" fill="url(#confGrad)" />
                        <Area type="monotone" dataKey="confidenceLow" stroke="none" fill="transparent" />
                        <Area type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 4" fill="url(#predGrad)" />
                        <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={false} connectNulls={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {analyticsTab === 'risk' && (
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/20 font-bold">AI Feature Importance — Risk Factors</p>
                    {[
                      { factor: 'Traffic Load', weight: 0.32, color: '#f43f5e' },
                      { factor: 'Temperature Variation', weight: 0.24, color: '#f59e0b' },
                      { factor: 'Pavement Age', weight: 0.19, color: '#6366f1' },
                      { factor: 'Moisture Level', weight: 0.14, color: '#3b82f6' },
                      { factor: 'Subgrade Condition', weight: 0.11, color: '#22c55e' },
                    ].map(({ factor, weight, color }) => (
                      <div key={factor} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60 font-medium">{factor}</span>
                          <span className="text-xs font-bold tabular-nums" style={{ color }}>{(weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${weight * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {analyticsTab === 'environment' && (
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/20 font-bold">Environmental Impact — CO₂ Reduction</p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={carbonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(10,12,30,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 11 }} />
                          <Bar dataKey="saved" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.8} />
                          <Bar dataKey="baseline" fill="rgba(255,255,255,0.06)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Carbon Repair Index */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white/80">Carbon Repair Index</h4>
                      <p className="text-[10px] text-white/25">Repair delay impact on CO₂ emissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-emerald-400 tabular-nums">{(carbonDelay * 0.47).toFixed(1)}t</p>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider font-bold">CO₂ increase</p>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-wider">
                    <span>Repair Delay</span>
                    <span className="text-white/60">{carbonDelay} days</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={carbonDelay}
                    onChange={(e) => setCarbonDelay(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-emerald-400 [&::-webkit-slider-thumb]:to-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                  <div className="flex justify-between text-[9px] text-white/15">
                    <span>Immediate</span>
                    <span>30 days</span>
                    <span>90 days</span>
                    <span>180 days</span>
                  </div>
                </div>

                {/* Impact metrics */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'CO₂ Impact', value: `+${(carbonDelay * 0.47).toFixed(1)}t`, color: carbonDelay > 60 ? '#f43f5e' : '#f59e0b' },
                    { label: 'Cost Increase', value: `+${(carbonDelay * 2.3).toFixed(0)}%`, color: carbonDelay > 90 ? '#f43f5e' : '#f59e0b' },
                    { label: 'Risk Factor', value: `${Math.min(100, carbonDelay * 0.55).toFixed(0)}%`, color: carbonDelay > 60 ? '#f43f5e' : '#22c55e' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                      <p className="text-lg font-extrabold tabular-nums" style={{ color }}>{value}</p>
                      <p className="text-[9px] text-white/20 uppercase tracking-wider font-bold mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ===================== LIVE MAP ===================== */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-[0.12em]">Live Sensor Network</h3>
              <Link href="/map">
                <button className="flex items-center gap-1.5 text-xs text-emerald-400/70 hover:text-emerald-400 font-medium transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  Full Map View
                  <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
            <SensorMap sensors={sensors} />
          </section>
        </main>
      </div>
    </div>
  );
}

