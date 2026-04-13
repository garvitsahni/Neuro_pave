'use client';

import { useEffect, useState } from 'react';
import { Sensor, SensorReading, generateHistoricalReadings } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Zap, Thermometer, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SensorAnalyticsProps {
  sensor: Sensor;
}

export function SensorAnalytics({ sensor }: SensorAnalyticsProps) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const response = await fetch(`/api/sensors/${sensor.id}/readings`);
        const data = await response.json();

        if (data.success) {
          setReadings(data.data.readings);
        }
      } catch (error) {
        console.error('Failed to fetch readings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [sensor.id]);

  const chartData = readings.map((r) => {
    const timestamp = typeof r.timestamp === 'string' ? new Date(r.timestamp) : r.timestamp;
    return {
      time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: r.value,
      timestamp: timestamp.getTime(),
    };
  });

  const stats = {
    min: readings.length > 0 ? Math.min(...readings.map((r) => r.value)) : 0,
    max: readings.length > 0 ? Math.max(...readings.map((r) => r.value)) : 0,
    avg:
      readings.length > 0
        ? Math.round((readings.reduce((sum, r) => sum + r.value, 0) / readings.length) * 100) / 100
        : 0,
    latest: readings.length > 0 ? readings[readings.length - 1].value : 0,
  };

  const typeColors: Record<string, string> = {
    vibration: '#3b82f6',
    strain: '#22c55e',
    temperature: '#f59e0b',
    humidity: '#8b5cf6',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    vibration: <Layers className="w-3.5 h-3.5" />,
    strain: <Zap className="w-3.5 h-3.5" />,
    temperature: <Thermometer className="w-3.5 h-3.5" />,
    humidity: <Droplets className="w-3.5 h-3.5" />,
  };

  const chartColor = typeColors[sensor.type] || '#6366f1';

  const statusColors: Record<string, string> = {
    operational: '#22c55e',
    warning: '#f59e0b',
    critical: '#f43f5e',
    offline: '#6b7280',
  };

  // Determine trend
  const trend = readings.length >= 2
    ? readings[readings.length - 1].value > readings[readings.length - 2].value ? 'up'
    : readings[readings.length - 1].value < readings[readings.length - 2].value ? 'down' : 'flat'
    : 'flat';

  return (
    <Card className="border-white/[0.06] bg-[#080c1a]/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md" style={{ backgroundColor: chartColor + '15', color: chartColor }}>
              {typeIcons[sensor.type]}
            </div>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColors[sensor.status], boxShadow: `0 0 6px ${statusColors[sensor.status]}60` }}
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#f43f5e' : '#6b7280' }}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {trend}
          </div>
        </div>
        <CardTitle className="text-sm font-bold tracking-tight text-white/85">{sensor.name}</CardTitle>
        <CardDescription className="text-[11px] text-white/30">{sensor.location}</CardDescription>

        <div className="grid grid-cols-4 gap-2 pt-3">
          {[
            { label: 'Latest', value: stats.latest },
            { label: 'Min', value: stats.min },
            { label: 'Max', value: stats.max },
            { label: 'Avg', value: stats.avg },
          ].map(({ label, value }) => (
            <div key={label} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold">{label}</p>
              <p className="font-bold text-xs text-white/70 tabular-nums mt-0.5">
                {value.toFixed(1)} <span className="text-white/30">{readings[0]?.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <p className="text-white/20 text-xs font-medium">Loading data...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="50%" stopColor={chartColor} stopOpacity={0.08} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.1)"
                style={{ fontSize: '10px' }}
                tick={{ fill: 'rgba(255,255,255,0.25)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.1)"
                style={{ fontSize: '10px' }}
                tick={{ fill: 'rgba(255,255,255,0.25)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10,15,30,0.95)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderRadius: '10px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(12px)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.8)',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${sensor.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center">
            <p className="text-white/20 text-xs font-medium">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
