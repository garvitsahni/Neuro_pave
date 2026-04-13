'use client';

import { useEffect, useState } from 'react';
import { Alert, Sensor } from '@/lib/mock-data';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { AlertsPanel } from '@/components/alerts-panel';
import { Spinner } from '@/components/ui/spinner';
import { Bell, ShieldAlert, ShieldCheck, Radio } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, sensorsRes] = await Promise.all([fetch('/api/alerts'), fetch('/api/sensors')]);
        const alertsData = await alertsRes.json();
        const sensorsData = await sensorsRes.json();
        setAlerts(alertsData.data.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
        setSensors(sensorsData.data.map((s: any) => ({ ...s, lastUpdate: new Date(s.lastUpdate) })));
      } catch (error) { console.error('Failed to fetch alerts:', error); }
      finally { setLoading(false); }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (id: string) => setAlerts(alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  const handleDismiss = (id: string) => setAlerts(alerts.filter((a) => a.id !== id));

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.resolved);
  const warningAlerts = alerts.filter((a) => a.severity === 'warning' && !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />
      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white/90 tracking-tight">Alert Center</h1>
              <p className="text-xs text-white/30">Monitor and manage system alerts</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96"><Spinner /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
                {[
                  { label: 'Critical', value: criticalAlerts.length, color: '#f43f5e', icon: <ShieldAlert className="w-4 h-4" /> },
                  { label: 'Warning', value: warningAlerts.length, color: '#f59e0b', icon: <Bell className="w-4 h-4" /> },
                  { label: 'Resolved', value: resolvedAlerts.length, color: '#22c55e', icon: <ShieldCheck className="w-4 h-4" /> },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: color + '12', color }}>{icon}</div>
                      <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-bold">{label}</p>
                    </div>
                    <p className="text-3xl font-extrabold tabular-nums" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              <AlertsPanel alerts={alerts} onAlertResolve={handleResolve} onAlertDismiss={handleDismiss} />

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-[0.12em] mb-5">Affected Sensors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Critical Sensors', status: 'critical' as const, color: '#f43f5e' },
                    { title: 'Warning Sensors', status: 'warning' as const, color: '#f59e0b' },
                  ].map(({ title, status, color }) => (
                    <div key={status}>
                      <p className="text-[10px] text-white/25 mb-3 uppercase tracking-widest font-bold flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'critical' ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }} />
                        {title}
                      </p>
                      <div className="space-y-2">
                        {sensors.filter((s) => s.status === status).map((s) => (
                          <div key={s.id} className="p-3 rounded-xl border" style={{ backgroundColor: color + '08', borderColor: color + '15' }}>
                            <div className="flex items-center gap-2">
                              <Radio className="w-3 h-3" style={{ color }} />
                              <p className="text-xs font-bold text-white/70">{s.name}</p>
                            </div>
                            <p className="text-[10px] text-white/25 ml-5 mt-0.5">{s.location}</p>
                          </div>
                        ))}
                        {sensors.filter((s) => s.status === status).length === 0 && (
                          <p className="text-xs text-white/15 p-3 bg-white/[0.02] rounded-xl border border-dashed border-white/[0.06] text-center">None</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

