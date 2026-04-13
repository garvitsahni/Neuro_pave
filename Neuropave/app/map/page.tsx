'use client';

import { useEffect, useState } from 'react';
import { Sensor } from '@/lib/mock-data';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { SensorMap } from '@/components/sensor-map';
import { Spinner } from '@/components/ui/spinner';
import { MapPin, Radio } from 'lucide-react';

export default function MapPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch('/api/sensors');
        const data = await response.json();
        setSensors(data.data.map((s: any) => ({ ...s, lastUpdate: new Date(s.lastUpdate) })));
      } catch (error) {
        console.error('Failed to fetch sensors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
    const interval = setInterval(fetchSensors, 10000);
    return () => clearInterval(interval);
  }, []);

  const statusColors: Record<string, string> = {
    operational: '#22c55e', warning: '#f59e0b', critical: '#f43f5e', offline: '#6b7280',
  };

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />
      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          {/* Page header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white/90 tracking-tight">Live Sensor Map</h1>
              <p className="text-xs text-white/30">Real-time location tracking and infrastructure monitoring</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Spinner />
            </div>
          ) : (
            <>
              <SensorMap sensors={sensors} onSensorSelect={setSelectedSensor} />

              {selectedSensor && (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]" style={{ borderColor: statusColors[selectedSensor.status] + '20' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: statusColors[selectedSensor.status] + '15' }}>
                      <Radio className="w-4 h-4" style={{ color: statusColors[selectedSensor.status] }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white/80">Sensor Details</h2>
                      <p className="text-[10px] text-white/25 font-mono">{selectedSensor.id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Name', value: selectedSensor.name },
                      { label: 'Location', value: selectedSensor.location },
                      { label: 'Type', value: selectedSensor.type, capitalize: true },
                      { label: 'Status', value: selectedSensor.status, capitalize: true, color: statusColors[selectedSensor.status] },
                      { label: 'Latitude', value: selectedSensor.latitude.toFixed(6) },
                      { label: 'Longitude', value: selectedSensor.longitude.toFixed(6) },
                      { label: 'Last Updated', value: (() => { const d = typeof selectedSensor.lastUpdate === 'string' ? new Date(selectedSensor.lastUpdate) : selectedSensor.lastUpdate; return d.toLocaleString(); })() },
                      { label: 'Sensor ID', value: selectedSensor.id, mono: true },
                    ].map(({ label, value, capitalize, color, mono }) => (
                      <div key={label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold mb-1">{label}</p>
                        <p className={`text-xs font-semibold text-white/70 ${capitalize ? 'capitalize' : ''} ${mono ? 'font-mono text-[10px]' : ''}`} style={color ? { color } : undefined}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Sensors', value: sensors.length, color: '#6366f1' },
                  { label: 'Operational', value: sensors.filter((s) => s.status === 'operational').length, color: '#22c55e' },
                  { label: 'Warning', value: sensors.filter((s) => s.status === 'warning').length, color: '#f59e0b' },
                  { label: 'Critical', value: sensors.filter((s) => s.status === 'critical').length, color: '#f43f5e' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold mb-2">{label}</p>
                    <p className="text-3xl font-extrabold tabular-nums" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

