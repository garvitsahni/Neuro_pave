'use client';

import { useEffect, useState } from 'react';
import { Sensor } from '@/lib/mock-data';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { SensorAnalytics } from '@/components/sensor-analytics';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, Gauge, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch('/api/sensors');
        const data = await response.json();
        setSensors(data.data.map((s: any) => ({ ...s, lastUpdate: new Date(s.lastUpdate) })));
      } catch (error) { console.error('Failed to fetch sensors:', error); }
      finally { setLoading(false); }
    };
    fetchSensors();
    const interval = setInterval(fetchSensors, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredSensors = () => {
    switch (activeTab) {
      case 'vibration': case 'strain': case 'temperature': case 'humidity':
        return sensors.filter((s) => s.type === activeTab);
      default: return sensors;
    }
  };
  const filteredSensors = getFilteredSensors();
  const sensorTypes = ['vibration', 'strain', 'temperature', 'humidity'] as const;
  const typeColors: Record<string, string> = { vibration: '#3b82f6', strain: '#22c55e', temperature: '#f59e0b', humidity: '#8b5cf6' };

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />
      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white/90 tracking-tight">Road Intelligence</h1>
              <p className="text-xs text-white/30">Historical data, trends, and AI-powered insights</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96"><Spinner /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: 'Total Sensors', value: sensors.length, color: '#6366f1', icon: <Activity className="w-4 h-4" /> },
                  { label: 'Active', value: sensors.filter((s) => s.status !== 'offline').length, color: '#22c55e', icon: <Gauge className="w-4 h-4" /> },
                  { label: 'Anomalies', value: sensors.filter((s) => s.status === 'warning' || s.status === 'critical').length, color: '#f59e0b', icon: <TrendingUp className="w-4 h-4" /> },
                  { label: 'Offline', value: sensors.filter((s) => s.status === 'offline').length, color: '#6b7280', icon: <Activity className="w-4 h-4" /> },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: color + '12', color }}>{icon}</div>
                      <p className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-bold">{label}</p>
                    </div>
                    <p className="text-3xl font-extrabold tabular-nums" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex w-fit gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                  <TabsTrigger value="all" className="rounded-xl text-xs font-bold px-4 data-[state=active]:bg-white/[0.08]">All ({sensors.length})</TabsTrigger>
                  {sensorTypes.map((type) => (
                    <TabsTrigger key={type} value={type} className="rounded-xl text-xs font-bold px-4 data-[state=active]:bg-white/[0.08]">
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: typeColors[type] }} />
                      {type.charAt(0).toUpperCase() + type.slice(1)} ({sensors.filter((s) => s.type === type).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={activeTab} className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredSensors.map((sensor) => (
                      <SensorAnalytics key={sensor.id} sensor={sensor} />
                    ))}
                  </div>
                  {filteredSensors.length === 0 && (
                    <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/[0.06] rounded-2xl">
                      <p className="text-white/25 text-sm">No sensors in this category</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

