'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { HelpCircle, Book, MessageSquare, Phone, LifeBuoy } from 'lucide-react';

export default function HelpPage() {
  const cards = [
    { title: 'Documentation', icon: <Book />, desc: 'Full platform documentation and API reference.' },
    { title: 'Community', icon: <MessageSquare />, desc: 'Connect with other urban engineers and data scientists.' },
    { title: 'Live Support', icon: <Phone />, desc: 'Priority 24/7 technical assistance for critical infrastructure.' },
    { title: 'System Status', icon: <LifeBuoy />, desc: 'Real-time uptime and service health monitoring.' },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar />
      <div className="flex-1 ml-[var(--app-sidebar-width)] transition-[margin] duration-300 ease-in-out flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <HelpCircle className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white/90 tracking-tight">Help & Support</h1>
              <p className="text-xs text-white/30">Get the most out of NeuroPave Road Intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <button key={card.title} className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all text-center group">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/30 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all flex items-center justify-center mx-auto mb-4">
                  {card.icon}
                </div>
                <h3 className="text-sm font-bold text-white/80 mb-2">{card.title}</h3>
                <p className="text-[10px] text-white/20 leading-relaxed group-hover:text-white/30 transition-colors uppercase font-bold tracking-widest">{card.desc}</p>
              </button>
            ))}
          </div>

          <section className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-white/[0.06] text-center max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-2">Still need help?</h2>
            <p className="text-sm text-white/40 mb-6">Our dedicated infrastructure team is ready to assist you with any questions or custom integration needs.</p>
            <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
              Contact Infrastructure Team
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

