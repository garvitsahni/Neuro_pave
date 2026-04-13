'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />
      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-5 h-5 text-white/70" />
              <h1 className="text-xl font-extrabold text-white/90 tracking-tight">Settings</h1>
            </div>
            <p className="text-sm text-white/35">System and user preferences will appear here.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

