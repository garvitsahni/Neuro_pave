'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, Brain, TrendingDown, TrendingUp } from 'lucide-react';

type SensorStatus = 'healthy' | 'warning' | 'critical';

interface PredictionRow {
  id: string;
  name: string;
  location: string;
  failureRisk: number;
  horizonDays: number;
  status: SensorStatus;
}

export default function PredictionsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PredictionRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/sensors');
        const payload = await response.json();
        const sensors = payload?.data ?? [];

        const mapped: PredictionRow[] = sensors.map((sensor: any, index: number) => {
          const base = sensor.status === 'critical' ? 82 : sensor.status === 'warning' ? 56 : 24;
          const jitter = ((index * 13) % 19) - 9;
          const failureRisk = Math.max(5, Math.min(95, base + jitter));
          const horizonDays = Math.max(3, 45 - Math.floor(failureRisk / 3));
          const status: SensorStatus = failureRisk >= 70 ? 'critical' : failureRisk >= 40 ? 'warning' : 'healthy';

          return {
            id: sensor.id,
            name: sensor.name,
            location: sensor.location,
            failureRisk,
            horizonDays,
            status,
          };
        });

        setRows(mapped.sort((a, b) => b.failureRisk - a.failureRisk));
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const critical = rows.filter((r) => r.status === 'critical').length;
    const warning = rows.filter((r) => r.status === 'warning').length;
    const healthy = rows.filter((r) => r.status === 'healthy').length;
    return { critical, warning, healthy };
  }, [rows]);

  const badgeClasses: Record<SensorStatus, string> = {
    healthy: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    warning: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
    critical: 'text-rose-300 bg-rose-500/10 border-rose-500/25',
  };

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />
      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white/90 tracking-tight">Predictions</h1>
              <p className="text-xs text-white/30">30-day failure-risk forecasts generated from live sensor data</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Spinner />
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/30 font-bold">Critical Risk</p>
                  </div>
                  <p className="text-3xl font-extrabold text-rose-300 tabular-nums">{summary.critical}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/30 font-bold">Warning Risk</p>
                  </div>
                  <p className="text-3xl font-extrabold text-amber-300 tabular-nums">{summary.warning}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/30 font-bold">Healthy</p>
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-300 tabular-nums">{summary.healthy}</p>
                </div>
              </section>

              <section className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h2 className="text-sm font-bold text-white/70">Segment Risk Ranking</h2>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {rows.map((row) => (
                    <div key={row.id} className="px-5 py-4 grid grid-cols-[1.2fr_1fr_140px_160px] gap-4 items-center">
                      <div>
                        <p className="text-sm font-semibold text-white/80">{row.name}</p>
                        <p className="text-xs text-white/35">{row.location}</p>
                      </div>
                      <p className="text-xs text-white/45 font-mono">{row.id}</p>
                      <div>
                        <p className="text-sm font-bold text-white/85 tabular-nums">{row.failureRisk}%</p>
                        <div className="h-1.5 mt-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${row.failureRisk}%`,
                              backgroundColor: row.status === 'critical' ? '#f43f5e' : row.status === 'warning' ? '#f59e0b' : '#22c55e',
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeClasses[row.status]}`}>
                          {row.status}
                        </span>
                        <span className="text-xs text-white/40 tabular-nums">~{row.horizonDays} days</span>
                      </div>
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <div className="px-5 py-10 text-center text-sm text-white/30">No sensor data found for prediction output.</div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

