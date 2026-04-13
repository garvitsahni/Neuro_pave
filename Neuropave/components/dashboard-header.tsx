'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Activity, Signal, Gauge, Wifi, Shield, ChevronDown } from 'lucide-react';

interface DashboardHeaderProps {
  totalSensors: number;
  activeSensors: number;
  criticalAlerts: number;
  warningAlerts: number;
}

export function DashboardHeader({
  totalSensors,
  activeSensors,
  criticalAlerts,
  warningAlerts,
}: DashboardHeaderProps) {
  const healthScore = Math.max(0, 100 - (criticalAlerts * 10) - (warningAlerts * 2));
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const healthColor = healthScore > 90 ? '#22c55e' : healthScore > 70 ? '#f59e0b' : '#f43f5e';
  const healthLabel = healthScore > 90 ? 'Excellent' : healthScore > 70 ? 'Moderate' : 'Critical';

  return (
    <header className="relative border-b border-white/[0.04] bg-gradient-to-r from-[#080c1a] via-[#0d1228] to-[#080c1a] sticky top-0 z-50">
      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-96 h-40 bg-blue-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-96 h-40 bg-emerald-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1600px] mx-auto">
        {/* Left — Brand */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            {/* Pulse ring on logo */}
            <div className="absolute -inset-1 rounded-xl bg-blue-500/20 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none mb-0.5">
              Neuro<span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Pave</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]">
                <span className="animate-ping absolute h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
              </span>
              <p className="text-[9px] uppercase tracking-[0.2em] text-blue-400/60 font-bold">Live Monitoring</p>
            </div>
          </div>
        </div>

        {/* Center — Stats Capsule */}
        <div className="flex items-center bg-white/[0.03] rounded-2xl p-1 border border-white/[0.06] shadow-inner shadow-black/20 backdrop-blur-sm">
          {/* Network */}
          <div className="px-4 py-2 flex flex-col min-w-[90px]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold mb-0.5">Network</span>
            <div className="flex items-center gap-2">
              <Signal className="w-3.5 h-3.5 text-blue-400/80" />
              <span className="text-lg font-black text-white tabular-nums">{totalSensors}</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/[0.06]" />

          {/* Online */}
          <div className="px-4 py-2 flex flex-col min-w-[90px]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold mb-0.5">Online</span>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-emerald-400/80" />
              <span className="text-lg font-black text-emerald-400 tabular-nums">{activeSensors}</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/[0.06]" />

          {/* Alerts */}
          <div className="px-4 py-2 flex flex-col min-w-[90px]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold mb-0.5">Alerts</span>
            <div className="flex items-center gap-2">
              <AlertCircle className={`w-3.5 h-3.5 ${criticalAlerts > 0 ? 'text-rose-400 animate-pulse' : 'text-white/20'}`} />
              <span className={`text-lg font-black tabular-nums ${criticalAlerts > 0 ? 'text-rose-400' : 'text-white/30'}`}>{criticalAlerts}</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/[0.06]" />

          {/* Health */}
          <div className="px-4 py-2 flex flex-col min-w-[120px]">
            <span className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-bold mb-0.5">Health</span>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-14">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${healthScore}%`, backgroundColor: healthColor, boxShadow: `0 0 8px ${healthColor}60` }}
                />
              </div>
              <span className="text-sm font-black tabular-nums" style={{ color: healthColor }}>{healthScore}%</span>
            </div>
          </div>
        </div>

        {/* Right — Time & CTA */}
        <div className="flex items-center gap-3">
          {/* Live clock */}
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-white/60 tabular-nums tracking-tight">{time}</p>
            <p className="text-[10px] text-white/25 font-medium">{date}</p>
          </div>

          <div className="w-px h-8 bg-white/[0.06] hidden md:block" />

          <button className="relative group bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2 ring-1 ring-white/10">
            <Shield className="w-3.5 h-3.5" />
            Control Center
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-xl bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </header>
  );
}

