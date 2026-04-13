'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import {
  Leaf,
  TrendingDown,
  Cloud,
  Zap,
  ArrowRight,
  ShieldCheck,
  Globe,
  Wind,
  Droplets,
  Trees,
  Info,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for carbon performance
const carbonHistory = [
  { month: 'Jan', savings: 45, target: 40 },
  { month: 'Feb', savings: 52, target: 42 },
  { month: 'Mar', savings: 48, target: 44 },
  { month: 'Apr', savings: 61, target: 46 },
  { month: 'May', savings: 58, target: 48 },
  { month: 'Jun', savings: 65, target: 50 },
  { month: 'Jul', savings: 72, target: 52 },
];

const impactData = [
  { name: 'Traditional Repair', co2: 120, fill: 'rgba(244, 63, 94, 0.6)' },
  { name: 'AI-Optimized', co2: 45, fill: 'rgba(34, 197, 94, 0.6)' },
  { name: 'Carbon-Neutral', co2: 12, fill: 'rgba(99, 102, 241, 0.6)' },
];

const lifecycleData = [
  { name: 'Extraction', value: 25 },
  { name: 'Production', value: 40 },
  { name: 'Transport', value: 15 },
  { name: 'Maintenance', value: 20 },
];

const COLORS = ['#6366f1', '#a855f7', '#3b82f6', '#22c55e'];

export default function CarbonPage() {
  const [carbonDelay, setCarbonDelay] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050505]">
        <AppSidebar />
        <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex items-center justify-center">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-pulse">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <p className="text-white/30 text-sm font-medium">Loading Environmental Intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />

      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header Section */}
          <section className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.02] to-transparent border border-white/[0.06]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sustainability Dashboard</span>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Carbon Index & Net-Zero Tracking</h1>
              <p className="text-white/40 text-sm max-w-xl font-medium leading-relaxed">
                Analyzing the environmental footprint of road infrastructure. NeuroPave AI optimizes repair schedules to minimize long-term CO₂ emissions and material waste.
              </p>
            </div>
          </section>

          {/* KPI Row */}
          <section className="grid grid-cols-4 gap-4">
            {[
              { label: 'Net CO₂ Offset', value: '1,428t', sub: '+12% vs last month', icon: <Cloud className="w-5 h-5" />, color: '#10b981' },
              { label: 'Energy Saved', value: '842 MWh', sub: 'Optimized logistics', icon: <Zap className="w-5 h-5" />, color: '#f59e0b' },
              { label: 'Material Recycled', value: '62%', sub: 'Asphalt reuse index', icon: <Droplets className="w-5 h-5" />, color: '#3b82f6' },
              { label: 'Green Index', value: 'A+', sub: 'Top 5% Eco Performance', icon: <ShieldCheck className="w-5 h-5" />, color: '#10b981' },
            ].map((kpi, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]" style={{ color: kpi.color }}>
                    {kpi.icon}
                  </div>
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{kpi.value}</h2>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{kpi.label}</p>
                <p className="text-xs text-white/40">{kpi.sub}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Carbon Repair Index Simulator */}
            <div className="lg:col-span-2 space-y-6">
              <section className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Carbon Repair Index (CRI)</h3>
                    <p className="text-sm text-white/40">Delay simulation: Potential emissions per day of postponement</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-rose-500 tabular-nums">
                      +{(carbonDelay * 0.42).toFixed(1)}t
                    </span>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Projected Waste</p>
                  </div>
                </div>

                {/* Slider UI */}
                <div className="space-y-8">
                  <div className="relative pt-6">
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={carbonDelay}
                      onChange={(e) => setCarbonDelay(Number(e.target.value))}
                      className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(16,185,129,0.5)] [&::-webkit-slider-thumb]:ring-4 [&::-webkit-slider-thumb]:ring-white/10"
                    />
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      <span>Proactive</span>
                      <span>Scheduled</span>
                      <span>Reactive</span>
                      <span>Deferred</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
                      <Wind className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">{(carbonDelay * 0.42).toFixed(1)}t</p>
                      <p className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-widest">CO₂ Emissions</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
                      <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">{(carbonDelay * 120).toLocaleString()}L</p>
                      <p className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-widest">Water Waste</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
                      <Trees className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">{(carbonDelay * 0.15).toFixed(1)}k</p>
                      <p className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-widest">Tree Equiv.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Carbon Savings History */}
              <section className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-white">Emission Reduction History</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-500/50" />
                      <span className="text-xs text-white/40">Savings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-white/10" />
                      <span className="text-xs text-white/40">Target</span>
                    </div>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={carbonHistory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0a0d1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                      <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} strokeDasharray="5 5" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Right: Insights & Breakdown */}
            <div className="space-y-6">
              <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-6">Material Breakdown</h3>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={lifecycleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {lifecycleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">40%</p>
                      <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Production</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  {lifecycleData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-xs text-white/50">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white/80">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-6">Method comparison</h3>
                <div className="space-y-6">
                  {impactData.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/60 font-medium">{item.name}</span>
                        <span className="text-xs text-white/40">{item.co2}t</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(item.co2 / 120) * 100}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all duration-300">
                <Leaf className="w-3.5 h-3.5" />
                Generate ESG Report
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80">AI Suggestion</p>
                  <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                    Prioritizing RD-04 for proactive repair could save an additional 12.4t of CO₂ by preventing asphalt oxidation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

