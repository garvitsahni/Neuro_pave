'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Route,
  Map,
  Brain,
  Leaf,
  FileBarChart,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Road Intelligence', href: '/analytics', icon: Route },
  { label: 'Live Map', href: '/map', icon: Map },
  { label: 'Predictions', href: '/predictions', icon: Brain },
  { label: 'Carbon Index', href: '/carbon', icon: Leaf },
  { label: 'Alerts', href: '/alerts', icon: AlertCircle },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
];

const bottomItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help', href: '/help', icon: HelpCircle },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    const saved = window.localStorage.getItem('np-sidebar-collapsed');
    if (saved === '1') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const applyWidth = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const width = isMobile ? '0px' : collapsed ? '68px' : '240px';
      document.documentElement.style.setProperty('--app-sidebar-width', width);
    };

    applyWidth();
    window.localStorage.setItem('np-sidebar-collapsed', collapsed ? '1' : '0');
    window.addEventListener('resize', applyWidth);
    return () => window.removeEventListener('resize', applyWidth);
  }, [collapsed]);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(8,8,8,0.98) 0%, rgba(2,2,2,0.99) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-40 h-40 bg-zinc-300/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className={`relative h-16 flex items-center ${collapsed ? 'justify-center px-2' : 'px-5'} border-b border-white/[0.04]`}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-500 via-zinc-400 to-zinc-600 flex items-center justify-center shadow-lg shadow-zinc-500/20">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            {/* Pulsing ring */}
            <div className="absolute -inset-0.5 rounded-xl bg-zinc-400/20 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                Neuro<span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-400">Pave</span>
              </h1>
              <p className="text-[8px] uppercase tracking-[0.25em] text-white/25 font-bold mt-0.5">AI Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold px-3 mb-3">Navigation</p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white bg-white/[0.08]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {/* Active glow indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-zinc-200 to-zinc-400 rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.45)]" />
              )}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-zinc-200' : 'group-hover:text-white/60'}`} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {/* Tooltip for collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0a0d1f] border border-white/10 rounded-lg text-xs font-medium text-white/80 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2.5 pb-3 space-y-1">
        {!collapsed && (
          <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold px-3 mb-2">System</p>
        )}
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/30 hover:text-white/50 hover:bg-white/[0.03] transition-all duration-200`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/20 hover:text-white/40 hover:bg-white/[0.03] transition-all duration-200 mt-2"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

