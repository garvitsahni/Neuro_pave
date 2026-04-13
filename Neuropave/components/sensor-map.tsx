'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Sensor } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

interface SensorMapProps {
  sensors: Sensor[];
  onSensorSelect?: (sensor: Sensor) => void;
}

// We need to load the map component dynamically to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] bg-[#0a0d1f] rounded-xl flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto animate-pulse">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
        </div>
        <p className="text-white/25 text-xs font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

export function SensorMap({ sensors, onSensorSelect }: SensorMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');

  const selectedSensor = sensors.find((s) => s.id === selectedMarker);

  const statusColors: Record<string, string> = {
    operational: '#22c55e', warning: '#f59e0b', critical: '#f43f5e', offline: '#6b7280',
  };

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedMarker(sensor.id);
    onSensorSelect?.(sensor);
  };

  return (
    <Card className="col-span-full overflow-hidden border-white/[0.06] bg-[#080c1a]/60 backdrop-blur-xl shadow-2xl shadow-black/20">
      <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap pb-4 border-b border-white/[0.04]">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">Live Sensor Network</CardTitle>
          <CardDescription className="text-xs text-white/30">San Francisco Bay Area — Real-time Infrastructure Monitoring</CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'heatmap', label: '🌡 Heatmap', active: showHeatmap, toggle: () => setShowHeatmap(v => !v), activeClass: 'bg-orange-500/15 border-orange-500/40 text-orange-300' },
            { key: 'connections', label: '🔗 Links', active: showConnections, toggle: () => setShowConnections(v => !v), activeClass: 'bg-blue-500/15 border-blue-500/40 text-blue-300' },
          ]).map(({ key, label, active, toggle, activeClass }) => (
            <button
              key={key}
              onClick={toggle}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 font-medium ${active ? activeClass : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'}`}
            >
              {label}
            </button>
          ))}
          {/* Map style toggle */}
          <button
            onClick={() => setMapStyle(s => s === 'dark' ? 'satellite' : 'dark')}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/30 hover:border-white/20 hover:text-white/50 transition-all duration-200 font-medium"
          >
            {mapStyle === 'dark' ? '🛰 Satellite' : '🗺 Dark'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
          {/* Map */}
          <div className="relative">
            <LeafletMap
              sensors={sensors}
              selectedId={selectedMarker}
              onSensorClick={handleSensorClick}
              showHeatmap={showHeatmap}
              showConnections={showConnections}
              mapStyle={mapStyle}
            />
          </div>

          {/* Sidebar */}
          <div className="border-l border-white/[0.04] bg-[#070b18]/80 p-4 space-y-4 max-h-[560px] overflow-y-auto">
            {/* Status Legend */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
              <h3 className="font-bold text-xs mb-3 text-white/90 uppercase tracking-widest">Status</h3>
              <div className="space-y-1.5">
                {([
                  { status: 'operational' as const, label: 'Operational', desc: 'Normal operation' },
                  { status: 'warning' as const, label: 'Warning', desc: 'Elevated readings' },
                  { status: 'critical' as const, label: 'Critical', desc: 'Immediate action' },
                  { status: 'offline' as const, label: 'Offline', desc: 'No signal' },
                ]).map(({ status, label, desc }) => (
                  <div key={status} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${status === 'critical' ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: statusColors[status], boxShadow: `0 0 8px ${statusColors[status]}50` }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-xs text-white/85">{label}</span>
                      <p className="text-[10px] text-white/30">{desc}</p>
                    </div>
                    <span className="text-xs font-black text-white/50 tabular-nums">
                      {sensors.filter((s) => s.status === status).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sensor Types */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
              <h3 className="font-bold text-xs mb-3 text-white/90 uppercase tracking-widest">Sensor Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'V', label: 'Vibration', color: '#3b82f6' },
                  { key: 'S', label: 'Strain', color: '#22c55e' },
                  { key: 'T', label: 'Temperature', color: '#f59e0b' },
                  { key: 'H', label: 'Humidity', color: '#8b5cf6' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ backgroundColor: color + '20', color, border: `1px solid ${color}30` }}>
                      {key}
                    </div>
                    <span className="text-xs text-white/50">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Sensor Info */}
            {selectedSensor ? (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5" style={{ borderColor: statusColors[selectedSensor.status] + '30', boxShadow: `0 0 20px ${statusColors[selectedSensor.status]}10` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${selectedSensor.status === 'critical' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: statusColors[selectedSensor.status], boxShadow: `0 0 8px ${statusColors[selectedSensor.status]}60` }}
                  />
                  <h3 className="font-bold text-xs text-white/90 uppercase tracking-widest">Selected</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Name', value: selectedSensor.name },
                    { label: 'Location', value: selectedSensor.location },
                    { label: 'Type', value: selectedSensor.type, capitalize: true },
                    { label: 'Status', value: selectedSensor.status, capitalize: true, color: statusColors[selectedSensor.status] },
                  ].map(({ label, value, capitalize, color }) => (
                    <div key={label} className="border-b border-white/[0.04] pb-2">
                      <p className="text-white/25 text-[10px] mb-0.5 uppercase tracking-wider font-bold">{label}</p>
                      <p className={`font-semibold text-xs text-white/80 ${capitalize ? 'capitalize' : ''}`} style={color ? { color } : undefined}>
                        {value}
                      </p>
                    </div>
                  ))}
                  <p className="text-[10px] text-white/25 pt-1 font-mono">
                    📍 {selectedSensor.latitude.toFixed(4)}, {selectedSensor.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06] p-5 text-center">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-2">
                  <span className="text-white/20 text-lg">📍</span>
                </div>
                <p className="text-xs font-semibold text-white/40 mb-0.5">No Sensor Selected</p>
                <p className="text-[10px] text-white/20">Click a marker to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

