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
const AdvancedMap = dynamic(() => import('@/components/ui/interactive-map').then((m) => m.AdvancedMap), {
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
  const typeColors: Record<Sensor['type'], string> = {
    vibration: '#3b82f6',
    strain: '#22c55e',
    temperature: '#f59e0b',
    humidity: '#8b5cf6',
  };
  const typeLetters: Record<Sensor['type'], string> = {
    vibration: 'V',
    strain: 'S',
    temperature: 'T',
    humidity: 'H',
  };

  const createLetterIconHtml = (sensor: Sensor, isSelected: boolean) => {
    const main = statusColors[sensor.status] ?? '#22c55e';
    const typeCol = typeColors[sensor.type] ?? '#ffffff';
    const letter = typeLetters[sensor.type] ?? '?';
    const size = isSelected ? 38 : 26;
    const ring = sensor.status === 'critical' || sensor.status === 'warning';

    return {
      size,
      html: `
        <div style="position:relative;width:${size}px;height:${size}px;">
          ${
            ring
              ? `<div style="position:absolute;inset:-6px;border-radius:999px;border:2px solid ${main};opacity:0.35;filter:drop-shadow(0 0 10px ${main}55);"></div>`
              : ''
          }
          <div style="
            position:absolute;inset:0;border-radius:999px;
            background: radial-gradient(circle at 32% 28%, ${main}ff 0%, ${main}aa 60%, ${main}66 100%);
            border: ${isSelected ? '2.5px solid rgba(255,255,255,0.85)' : `2px solid ${main}c0`};
            box-shadow: 0 0 ${isSelected ? 22 : 14}px ${main}60, 0 2px 10px rgba(0,0,0,0.55);
            display:flex;align-items:center;justify-content:center;
            font-family: Inter, system-ui, sans-serif;
            font-weight: 900;
            color: rgba(255,255,255,0.95);
            text-shadow: 0 1px 3px rgba(0,0,0,0.55);
            font-size: ${isSelected ? 15 : 10}px;
            line-height: 1;
          ">${letter}</div>
          <div style="
            position:absolute;
            bottom:${isSelected ? 1 : 0}px;
            right:${isSelected ? 1 : 0}px;
            width:${isSelected ? 9 : 7}px;
            height:${isSelected ? 9 : 7}px;
            border-radius:999px;
            background:${typeCol};
            border:1.5px solid rgba(8,10,24,0.8);
            box-shadow: 0 0 8px ${typeCol}80;
          "></div>
        </div>
      `,
    };
  };

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedMarker(sensor.id);
    onSensorSelect?.(sensor);
  };

  const markers = useMemo(
    () =>
      sensors.map((s) => ({
        ...(() => {
          const icon = createLetterIconHtml(s, s.id === selectedMarker);
          return { iconHtml: icon.html, iconSizePx: icon.size };
        })(),
        id: s.id,
        position: [s.latitude, s.longitude] as [number, number],
        popup: {
          title: s.name,
          content: `${s.location} • ${s.type} • ${s.status}`,
          image:
            'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=640&q=60',
        },
        raw: s,
      })),
    [sensors, selectedMarker],
  );

  const circles = useMemo(() => {
    if (!showHeatmap) return [];
    return sensors.map((s) => {
      const col = statusColors[s.status] ?? '#22c55e';
      const sev = s.status === 'critical' ? 1 : s.status === 'warning' ? 0.7 : s.status === 'offline' ? 0.25 : 0.35;
      return {
        id: `${s.id}-heat`,
        center: [s.latitude, s.longitude] as [number, number],
        radius: 450,
        style: { color: 'transparent', weight: 0, fillColor: col, fillOpacity: 0.12 * sev },
      };
    });
  }, [sensors, showHeatmap, statusColors]);

  const polylines = useMemo(() => {
    if (!showConnections) return [];
    const groups: Record<string, Sensor[]> = {};
    sensors.forEach((s) => {
      (groups[s.location] ??= []).push(s);
    });
    const lines: Array<{ id: string; positions: [number, number][]; style: any }> = [];
    Object.entries(groups).forEach(([loc, grp]) => {
      if (grp.length < 2) return;
      const hasCrit = grp.some((s) => s.status === 'critical');
      const hasWarn = grp.some((s) => s.status === 'warning');
      const color = hasCrit ? '#f43f5e' : hasWarn ? '#f59e0b' : '#22c55e';
      for (let i = 0; i < grp.length - 1; i++) {
        for (let j = i + 1; j < grp.length; j++) {
          lines.push({
            id: `${loc}-${i}-${j}`,
            positions: [
              [grp[i].latitude, grp[i].longitude],
              [grp[j].latitude, grp[j].longitude],
            ],
            style: {
              color,
              weight: hasCrit ? 2.0 : 1.4,
              opacity: hasCrit ? 0.55 : hasWarn ? 0.45 : 0.3,
              dashArray: hasCrit ? '4 5' : hasWarn ? '5 7' : '6 9',
            },
          });
        }
      }
    });
    return lines;
  }, [sensors, showConnections]);

  return (
    <Card className="col-span-full overflow-hidden border-white/[0.06] bg-[#080c1a]/60 backdrop-blur-xl shadow-2xl shadow-black/20">
      <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap pb-4 border-b border-white/[0.04]">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">Live Sensor Network</CardTitle>
          <CardDescription className="text-xs text-white/30">Delhi NCR — Real-time Road & Bridge Monitoring</CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'heatmap', label: '🌡 Heatmap', active: showHeatmap, toggle: () => setShowHeatmap(v => !v), activeClass: 'bg-orange-500/15 border-orange-500/40 text-orange-300' },
            { key: 'connections', label: '🔗 Links', active: showConnections, toggle: () => setShowConnections(v => !v), activeClass: 'bg-blue-500/15 border-blue-500/40 text-blue-300' },
          ]).map(({ key, label, active, toggle, activeClass }) => (
            <button
              key={key}
              onClick={toggle}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-smooth-fast font-medium ${active ? activeClass : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'}`}
            >
              {label}
            </button>
          ))}
          {/* Map style toggle */}
          <button
            onClick={() => setMapStyle(s => s === 'dark' ? 'satellite' : 'dark')}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-white/30 hover:border-white/20 hover:text-white/50 transition-smooth-fast font-medium"
          >
            {mapStyle === 'dark' ? '🛰 Satellite' : '🗺 Dark'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
          {/* Map */}
          <div className="relative">
            <div className="w-full h-[560px] bg-black rounded-xl overflow-hidden">
              <AdvancedMap
                center={[28.6139, 77.2090]}
                zoom={11}
                markers={markers}
                circles={circles}
                polylines={polylines}
                enableClustering={true}
                enableSearch={true}
                enableControls={true}
                mapLayers={{
                  openstreetmap: true,
                  satellite: mapStyle === 'satellite',
                  traffic: false,
                }}
                onMarkerClick={(m: any) => {
                  const sensor = (m?.raw ?? null) as Sensor | null;
                  if (sensor) handleSensorClick(sensor);
                }}
                style={{ height: '560px', width: '100%' }}
              />
            </div>
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

