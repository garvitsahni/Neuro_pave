'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, User, ChevronDown } from 'lucide-react';

export function TopBar() {
  const [time, setTime] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.04] bg-[#0b0b0b]/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Left — Page context */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-bold">Smart City Platform</p>
          <p className="text-xs text-white/50 font-medium tabular-nums">{time}</p>
        </div>
      </div>

      {/* Center — Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search roads, sensors, predictions..."
            className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white/20 font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group">
          <Bell className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
          {/* Notification dot */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-zinc-300 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.55)]">
            <div className="absolute inset-0 bg-zinc-200 rounded-full animate-ping opacity-40" />
          </div>
        </button>

        {/* CTA Button */}
        <button className="relative group flex items-center gap-2 h-10 px-4 bg-gradient-to-r from-zinc-700 to-zinc-500 hover:from-zinc-600 hover:to-zinc-400 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-lg shadow-zinc-500/20 active:scale-[0.98] ring-1 ring-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Run Prediction</span>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-zinc-300/10 to-zinc-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/[0.06]" />

        {/* User */}
        <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-400/30 to-zinc-600/30 border border-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-white/50" />
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-semibold text-white/70 leading-none">Garvit Sahni</p>
            <p className="text-[10px] text-white/25 mt-0.5">Admin</p>
          </div>
          <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors hidden lg:block" />
        </button>
      </div>
    </header>
  );
}

