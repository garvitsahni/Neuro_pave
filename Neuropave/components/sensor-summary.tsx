'use client';

import { useEffect, useState } from 'react';
import { Sensor } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface SensorSummaryProps {
  sensors: Sensor[];
}

export function SensorSummary({ sensors }: SensorSummaryProps) {
  const [summary, setSummary] = useState({
    operational: 0,
    warning: 0,
    critical: 0,
    offline: 0,
  });

  useEffect(() => {
    const counts = sensors.reduce(
      (acc, sensor) => ({
        ...acc,
        [sensor.status]: (acc[sensor.status] || 0) + 1,
      }),
      { operational: 0, warning: 0, critical: 0, offline: 0 }
    );
    setSummary(counts as typeof summary);
  }, [sensors]);

  const total = sensors.length;
  const statuses = [
    { label: 'Operational', value: summary.operational, color: '#22c55e', pct: total > 0 ? (summary.operational / total) * 100 : 0 },
    { label: 'Warning', value: summary.warning, color: '#f59e0b', pct: total > 0 ? (summary.warning / total) * 100 : 0 },
    { label: 'Critical', value: summary.critical, color: '#f43f5e', pct: total > 0 ? (summary.critical / total) * 100 : 0 },
    { label: 'Offline', value: summary.offline, color: '#6b7280', pct: total > 0 ? (summary.offline / total) * 100 : 0 },
  ];

  return (
    <Card className="border-white/[0.06] bg-[#080c1a]/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold tracking-tight">System Status</CardTitle>
        <CardDescription className="text-xs text-white/30">Sensor distribution by status</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual distribution bar */}
        <div className="flex h-2 rounded-full overflow-hidden mb-4 bg-white/[0.04]">
          {statuses.map((status) => (
            <div
              key={status.label}
              className="transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${status.pct}%`,
                backgroundColor: status.color,
                boxShadow: `0 0 8px ${status.color}40`,
              }}
            />
          ))}
        </div>

        <div className="space-y-2">
          {statuses.map((status) => (
            <div key={status.label} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: status.color, boxShadow: `0 0 6px ${status.color}40` }}
                />
                <span className="text-xs text-white/60 font-medium">{status.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/25 tabular-nums">{status.pct.toFixed(0)}%</span>
                <span className="font-black text-xs text-white/70 tabular-nums w-5 text-right">{status.value}</span>
              </div>
            </div>
          ))}
          <div className="border-t border-white/[0.04] pt-2.5 mt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-white/50">Total</span>
            <span className="font-black text-sm text-white/80 tabular-nums">{sensors.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
