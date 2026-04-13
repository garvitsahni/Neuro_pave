'use client';

import { Sensor } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Zap, Layers, Droplets, ArrowUpRight, ArrowDownRight, Clock, Activity } from 'lucide-react';

interface SensorCardProps {
  sensor: Sensor;
  reading?: number;
  unit?: string;
}

export function SensorCard({ sensor, reading, unit }: SensorCardProps) {
  const typeIcons = {
    vibration: <Layers className="w-4 h-4" />,
    strain: <Zap className="w-4 h-4" />,
    temperature: <Thermometer className="w-4 h-4" />,
    humidity: <Droplets className="w-4 h-4" />,
  };

  const typeColors: Record<string, string> = {
    vibration: '#3b82f6',
    strain: '#22c55e',
    temperature: '#f59e0b',
    humidity: '#8b5cf6',
  };

  const statusThemes = {
    operational: {
      border: 'border-emerald-500/20',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      dot: '#22c55e',
      glow: '0 0 30px rgba(34,197,94,0.06)',
    },
    warning: {
      border: 'border-amber-500/20',
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      dot: '#f59e0b',
      glow: '0 0 30px rgba(245,158,11,0.08)',
    },
    critical: {
      border: 'border-rose-500/20',
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      dot: '#f43f5e',
      glow: '0 0 30px rgba(244,63,94,0.1)',
    },
    offline: {
      border: 'border-zinc-500/20',
      badge: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
      dot: '#6b7280',
      glow: 'none',
    },
  };

  const theme = statusThemes[sensor.status];
  const tColor = typeColors[sensor.type] || '#6366f1';
  const isIncreasing = reading !== undefined && reading > 0.5;

  // Generate deterministic sparkline data from sensor id
  const sparkData = Array.from({ length: 12 }, (_, i) => {
    const seed = (sensor.id.charCodeAt(sensor.id.length - 1) * (i + 1) * 7) % 100;
    return seed / 100;
  });

  return (
    <Card
      className={`relative overflow-hidden group transition-all duration-300 hover:translate-y-[-2px] bg-[#0a0e1f]/50 backdrop-blur-md border ${theme.border}`}
      style={{ boxShadow: theme.glow }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${tColor}60, transparent)` }}
      />

      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between gap-3">
          <div
            className="p-2 rounded-lg border flex-shrink-0"
            style={{
              backgroundColor: tColor + '10',
              borderColor: tColor + '20',
              color: tColor,
            }}
          >
            {typeIcons[sensor.type] || <Activity className="w-4 h-4" />}
          </div>
          <Badge className={`border font-bold uppercase tracking-[0.12em] text-[9px] ${theme.badge} py-0.5 px-2 rounded-md`}>
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${sensor.status === 'critical' ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: theme.dot, boxShadow: `0 0 4px ${theme.dot}80` }}
            />
            {sensor.status}
          </Badge>
        </div>
        <div className="mt-3">
          <CardTitle className="text-sm font-bold text-white/90 tracking-tight leading-tight line-clamp-1">{sensor.name}</CardTitle>
          <CardDescription className="text-[11px] text-white/30 flex items-center gap-1 mt-1">
            <span className="truncate">{sensor.location}</span>
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pb-4 px-4">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/25 font-bold mb-1.5">Live Reading</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black tracking-tighter ${reading !== undefined ? 'text-white' : 'text-white/15'}`}>
                {reading !== undefined ? reading.toFixed(1) : '---'}
              </span>
              <span className="text-xs font-bold text-white/30">{unit || '--'}</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="flex items-center gap-2 mb-1.5">
            <svg width="56" height="28" viewBox="0 0 56 28" className="opacity-60 group-hover:opacity-90 transition-opacity">
              <defs>
                <linearGradient id={`spark-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={tColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                d={`M0,${28 - sparkData[0] * 24} ${sparkData.map((v, i) => `L${(i / (sparkData.length - 1)) * 56},${28 - v * 24}`).join(' ')} L56,28 L0,28 Z`}
                fill={`url(#spark-${sensor.id})`}
              />
              {/* Line */}
              <path
                d={`M0,${28 - sparkData[0] * 24} ${sparkData.map((v, i) => `L${(i / (sparkData.length - 1)) * 56},${28 - v * 24}`).join(' ')}`}
                fill="none"
                stroke={tColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {reading !== undefined && (
              <div className={`p-1 rounded-md ${isIncreasing ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {isIncreasing ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.12em]">
          <div className="flex items-center gap-1.5 text-white/25">
            <Clock className="w-3 h-3" />
            <span>Updated: {(() => {
              const lastUpdate = typeof sensor.lastUpdate === 'string' ? new Date(sensor.lastUpdate) : sensor.lastUpdate;
              return lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            })()}</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: theme.dot + '90' }}>
            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
            Live
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
