'use client';

import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════════════════════
   NeuroPave — Premium Futuristic Landing Page
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Animated Grid Background ────────────────────────────────────────────────
function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.003;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const spacing = 60;
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;

      // Perspective grid
      for (let i = 0; i < cols; i++) {
        const x = i * spacing;
        const wave = Math.sin(t + i * 0.15) * 8;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + wave, h);
        const alpha = 0.03 + Math.sin(t + i * 0.2) * 0.015;
        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (let j = 0; j < rows; j++) {
        const y = j * spacing;
        const wave = Math.sin(t * 0.8 + j * 0.1) * 6;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(w, y + wave);
        const alpha = 0.025 + Math.sin(t + j * 0.15) * 0.012;
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Glowing dots at intersections
      for (let i = 0; i < cols; i += 3) {
        for (let j = 0; j < rows; j += 3) {
          const x = i * spacing + Math.sin(t + i * 0.15) * 8;
          const y = j * spacing + Math.sin(t * 0.8 + j * 0.1) * 6;
          const pulse = Math.sin(t * 2 + i + j) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 1.5 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${0.15 + pulse * 0.15})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Floating Orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { color: 'rgba(99,102,241,0.12)', size: 600, x: '10%', y: '-10%', dur: 25 },
        { color: 'rgba(16,185,129,0.08)', size: 500, x: '70%', y: '20%', dur: 30 },
        { color: 'rgba(168,85,247,0.06)', size: 700, x: '50%', y: '60%', dur: 35 },
        { color: 'rgba(59,130,246,0.07)', size: 400, x: '80%', y: '80%', dur: 20 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            left: orb.x,
            top: orb.y,
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Section wrapper with scroll animation ───────────────────────────────────
function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

// ── Glassmorphism Card ──────────────────────────────────────────────────────
function GlassCard({
  children,
  className = '',
  glowColor = 'rgba(99,102,241,0.15)',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <motion.div
      className={`relative rounded-2xl border border-white/[0.06] overflow-hidden ${className}`}
      style={{
        background: 'rgba(8,10,24,0.6)',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 40px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      whileHover={{
        scale: 1.02,
        borderColor: 'rgba(255,255,255,0.12)',
        transition: { duration: 0.3 },
      }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated Counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const dur = 2000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── 3D Road Canvas ──────────────────────────────────────────────────────────
function Road3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    const draw = () => {
      t += 0.015;
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      // Vanishing point perspective road
      const vpX = w / 2;
      const vpY = h * 0.35;
      const roadWidthBottom = w * 0.6;
      const roadWidthTop = w * 0.05;

      // Draw road surface
      const grad = ctx.createLinearGradient(0, vpY, 0, h);
      grad.addColorStop(0, 'rgba(20,24,45,0.8)');
      grad.addColorStop(1, 'rgba(10,12,25,0.95)');
      ctx.beginPath();
      ctx.moveTo(vpX - roadWidthTop, vpY);
      ctx.lineTo(vpX + roadWidthTop, vpY);
      ctx.lineTo(w / 2 + roadWidthBottom / 2, h);
      ctx.lineTo(w / 2 - roadWidthBottom / 2, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Road edges (glowing)
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(vpX + roadWidthTop * side, vpY);
        ctx.lineTo(w / 2 + (roadWidthBottom / 2) * side, h);
        ctx.strokeStyle = 'rgba(99,102,241,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Center dashes — scrolling
      const dashCount = 20;
      for (let i = 0; i < dashCount; i++) {
        const raw = ((i / dashCount) + t * 0.3) % 1;
        const p = Math.pow(raw, 1.8); // perspective compression
        const y = vpY + (h - vpY) * p;
        const xWidth = roadWidthTop + (roadWidthBottom / 2 - roadWidthTop) * p;
        const dashLen = 3 + p * 15;
        const dashAlpha = 0.1 + p * 0.5;

        ctx.beginPath();
        ctx.moveTo(vpX, y);
        ctx.lineTo(vpX, y + dashLen);
        ctx.strokeStyle = `rgba(250,204,21,${dashAlpha})`;
        ctx.lineWidth = 1 + p * 2;
        ctx.stroke();
      }

      // Sensor glow points
      const sensorPositions = [0.3, 0.5, 0.7, 0.85];
      sensorPositions.forEach((sp, idx) => {
        const p = sp;
        const y = vpY + (h - vpY) * p;
        const xOff = (roadWidthTop + (roadWidthBottom / 2 - roadWidthTop) * p) * 0.5;
        const pulse = Math.sin(t * 3 + idx * 1.5) * 0.5 + 0.5;
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];
        const col = colors[idx];

        // Glow circle
        const r = 4 + pulse * 4;
        const gradient = ctx.createRadialGradient(vpX + xOff * (idx % 2 === 0 ? -1 : 1), y, 0, vpX + xOff * (idx % 2 === 0 ? -1 : 1), y, r * 3);
        gradient.addColorStop(0, col + '80');
        gradient.addColorStop(1, col + '00');
        ctx.beginPath();
        ctx.arc(vpX + xOff * (idx % 2 === 0 ? -1 : 1), y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(vpX + xOff * (idx % 2 === 0 ? -1 : 1), y, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      // Scanning line
      const scanY = vpY + (h - vpY) * ((Math.sin(t) * 0.5 + 0.5) * 0.8 + 0.1);
      const scanWidth = roadWidthTop + (roadWidthBottom / 2 - roadWidthTop) * ((scanY - vpY) / (h - vpY));
      ctx.beginPath();
      ctx.moveTo(vpX - scanWidth, scanY);
      ctx.lineTo(vpX + scanWidth, scanY);
      const scanGrad = ctx.createLinearGradient(vpX - scanWidth, scanY, vpX + scanWidth, scanY);
      scanGrad.addColorStop(0, 'rgba(99,102,241,0)');
      scanGrad.addColorStop(0.5, 'rgba(99,102,241,0.6)');
      scanGrad.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-2xl"
      style={{ height: 420, background: 'transparent' }}
    />
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(3,3,3,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-black text-lg">N</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Neuro<span className="text-indigo-400">Pave</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Problem', 'Solution', 'Features', 'Impact', 'Tech'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-white/40 text-sm font-medium hover:text-white/90 transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold
                     hover:from-indigo-500 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-indigo-500/20"
        >
          Live Demo →
        </Link>
      </div>
    </motion.nav>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      <GridBackground />
      <FloatingOrbs />
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════════
          1. HERO SECTION
          ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left — Copy */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-indigo-300 tracking-wide">AI-POWERED INFRASTRUCTURE</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Reinventing
              <br />
              Roads with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                AI
              </span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-white/40 max-w-lg leading-relaxed mb-4 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-white/70 font-medium">Predict</span> · <span className="text-white/70 font-medium">Prevent</span> · <span className="text-white/70 font-medium">Optimize</span> Infrastructure
            </motion.p>

            <motion.p
              className="text-base text-white/30 max-w-lg leading-relaxed mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              NeuroPave uses AI and real-time sensor data to predict road damage, prevent potholes, and build smarter, safer cities.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                href="/"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-sm
                           shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40
                           hover:from-indigo-500 hover:to-emerald-500 transition-all duration-500 flex items-center gap-2"
              >
                <span>Live Demo</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-2xl border border-white/10 text-white/60 font-bold text-sm
                           hover:border-white/25 hover:text-white/90 hover:bg-white/[0.03] transition-all duration-300"
              >
                View Architecture
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              className="flex gap-10 mt-14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[
                { value: 40, suffix: '%', label: 'Cost Reduction' },
                { value: 96, suffix: '%', label: 'Detection Rate' },
                { value: 72, suffix: 'h', label: 'Early Warning' },
              ].map(({ value, suffix, label }) => (
                <div key={label}>
                  <p className="text-2xl md:text-3xl font-black text-white/90 tabular-nums">
                    <Counter target={value} suffix={suffix} />
                  </p>
                  <p className="text-xs text-white/25 mt-1 font-medium uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D Road */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <Road3DCanvas />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-3 rounded-full bg-indigo-400/50" />
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2. PROBLEM SECTION
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="problem" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span className="text-xs font-bold tracking-[0.2em] text-rose-400/80 uppercase">
              The Problem
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
              Roads Are <span className="text-rose-400">Failing</span>
            </h2>
            <p className="text-white/30 max-w-2xl mx-auto text-lg">
              Reactive maintenance costs billions and endangers millions. We can do better.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🕳️', title: 'Potholes & Cracks', desc: '33% of road fatalities linked to poor conditions', color: '#f43f5e' },
              { icon: '💸', title: 'Wasted Billions', desc: '₹1.2 lakh crore spent annually on reactive repairs', color: '#f59e0b' },
              { icon: '⏰', title: 'Too Late', desc: 'Damage detected only after accidents or complaints', color: '#ef4444' },
              { icon: '📉', title: 'No Prediction', desc: 'Zero AI adoption in 95% of road maintenance systems', color: '#f97316' },
            ].map(({ icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-7 h-full" glowColor={color + '15'}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                    style={{ background: color + '12', border: `1px solid ${color}20` }}
                  >
                    {icon}
                  </div>
                  <h3 className="font-bold text-white/90 mb-2 text-base">{title}</h3>
                  <p className="text-sm text-white/30 leading-relaxed">{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          3. SOLUTION SECTION
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="solution" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-emerald-400/80 uppercase">
              The Solution
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
              AI-Powered <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Intelligence</span>
            </h2>
            <p className="text-white/30 max-w-2xl mx-auto text-lg">
              From reactive to predictive. NeuroPave transforms how cities manage road infrastructure.
            </p>
          </div>

          {/* Pipeline flow */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Detect',
                desc: 'AI-powered computer vision analyzes road imagery and sensor data to detect damage in real-time.',
                icon: '🔍',
                color: '#6366f1',
              },
              {
                step: '02',
                title: 'Predict',
                desc: 'XGBoost ML models predict when and where road failures will occur — days before they happen.',
                icon: '🧠',
                color: '#10b981',
              },
              {
                step: '03',
                title: 'Optimize',
                desc: 'Smart scheduling engine prioritizes maintenance by risk, cost, and impact. Zero wasted budget.',
                icon: '⚡',
                color: '#8b5cf6',
              },
            ].map(({ step, title, desc, icon, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassCard className="p-8 h-full relative overflow-visible" glowColor={color + '20'}>
                  {/* Step number */}
                  <span
                    className="absolute -top-4 -left-2 text-7xl font-black opacity-[0.04]"
                    style={{ color }}
                  >
                    {step}
                  </span>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                    style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)`, border: `1px solid ${color}25` }}
                  >
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-white/90 mb-3">{title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{desc}</p>

                  {/* Connector arrow (except last) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-6 h-6 rounded-full bg-[#0a0c1a] border border-white/10 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          4. HOW IT WORKS
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="how-it-works" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-bold tracking-[0.2em] text-indigo-400/80 uppercase">
              Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">
              How It <span className="text-indigo-400">Works</span>
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                step: 1,
                title: 'Data Collection',
                desc: 'IoT sensors (vibration, strain, temperature, humidity) continuously stream road health data.',
                icon: '📡',
                color: '#3b82f6',
              },
              {
                step: 2,
                title: 'AI Processing',
                desc: 'Computer vision + XGBoost ensemble models process raw data into actionable intelligence.',
                icon: '🤖',
                color: '#6366f1',
              },
              {
                step: 3,
                title: 'Prediction Engine',
                desc: 'Real-time risk scoring predicts days until pothole formation for each road segment.',
                icon: '📊',
                color: '#10b981',
              },
              {
                step: 4,
                title: 'Smart Dashboard',
                desc: 'Interactive maps, alerts, and maintenance scheduling — accessible from anywhere.',
                icon: '🖥️',
                color: '#8b5cf6',
              },
            ].map(({ step, title, desc, icon, color }, i) => (
              <motion.div
                key={step}
                className="flex gap-6 items-start relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl z-10"
                    style={{
                      background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                      border: `2px solid ${color}40`,
                      boxShadow: `0 0 25px ${color}20`,
                    }}
                  >
                    {icon}
                  </div>
                  {i < 3 && (
                    <div className="w-px h-16 bg-gradient-to-b from-white/10 to-transparent my-2" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-8 pt-1">
                  <span className="text-[10px] font-bold text-white/15 uppercase tracking-[0.2em]">Step {step}</span>
                  <h3 className="text-lg font-bold text-white/90 mt-1">{title}</h3>
                  <p className="text-sm text-white/30 mt-2 max-w-md leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          5. FEATURES
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="features" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-purple-400/80 uppercase">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">
              Built for <span className="text-purple-400">Scale</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📍', title: 'Real-time Monitoring', desc: 'Live sensor network with 200ms data refresh. See road health as it happens.', color: '#3b82f6' },
              { icon: '🔮', title: 'Predictive Maintenance', desc: 'XGBoost predicts road decay 30-90 days in advance with 96% accuracy.', color: '#10b981' },
              { icon: '🏙️', title: 'Smart City Ready', desc: 'APIs and dashboards built for municipal integration from day one.', color: '#6366f1' },
              { icon: '💰', title: 'Cost Optimization', desc: 'Reduce maintenance budgets by 40% through intelligent scheduling.', color: '#f59e0b' },
              { icon: '🛡️', title: 'Safety Intelligence', desc: 'Automated alerts for critical zones. Zero-delay incident prevention.', color: '#f43f5e' },
              { icon: '🌱', title: 'Carbon Reduction', desc: 'Optimized routes and fewer emergency repairs = lower carbon footprint.', color: '#22c55e' },
            ].map(({ icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard className="p-7 h-full group" glowColor={color + '12'}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: color + '12', border: `1px solid ${color}20` }}
                  >
                    {icon}
                  </div>
                  <h3 className="font-bold text-white/90 mb-2">{title}</h3>
                  <p className="text-sm text-white/30 leading-relaxed">{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          6. TECH STACK
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="tech" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-cyan-400/80 uppercase">
              Technology
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4">
              Powered By <span className="text-cyan-400">Innovation</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            {[
              { name: 'Next.js', icon: '▲', color: '#ffffff' },
              { name: 'React', icon: '⚛️', color: '#61dafb' },
              { name: 'Node.js', icon: '⬢', color: '#68a063' },
              { name: 'XGBoost', icon: '🧠', color: '#10b981' },
              { name: 'OpenCV', icon: '👁️', color: '#5c3ee8' },
              { name: 'Python', icon: '🐍', color: '#3776ab' },
              { name: 'Leaflet', icon: '🗺️', color: '#199900' },
              { name: 'ONNX', icon: '⚙️', color: '#f59e0b' },
            ].map(({ name, icon, color }, i) => (
              <motion.div
                key={name}
                className="group relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.1 }}
              >
                <div
                  className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/[0.06]
                             transition-all duration-500 group-hover:border-white/20 cursor-default"
                  style={{
                    background: 'rgba(8,10,24,0.5)',
                    boxShadow: `0 0 0 rgba(0,0,0,0)`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${color}25`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
                  }}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          7. IMPACT SECTION
          ════════════════════════════════════════════════════════════════════ */}
      <Section id="impact" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] text-emerald-400/80 uppercase">
              Impact
            </span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
              Real World <span className="text-emerald-400">Impact</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                value: 40,
                suffix: '%',
                label: 'Reduction in Accidents',
                desc: 'Early detection and predictive alerts prevent road incidents before they happen.',
                color: '#f43f5e',
                icon: '🛡️',
              },
              {
                value: 60,
                suffix: '%',
                label: 'Lower Maintenance Costs',
                desc: 'Predictive scheduling eliminates wasteful reactive repairs and emergency fixes.',
                color: '#f59e0b',
                icon: '💰',
              },
              {
                value: 3,
                suffix: 'x',
                label: 'Infrastructure Lifespan',
                desc: 'Proactive care extends road life by 3x, building truly sustainable cities.',
                color: '#10b981',
                icon: '🌍',
              },
            ].map(({ value, suffix, label, desc, color, icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassCard className="p-8 text-center h-full" glowColor={color + '15'}>
                  <span className="text-4xl mb-4 block">{icon}</span>
                  <p className="text-5xl font-black mb-3 tabular-nums" style={{ color }}>
                    <Counter target={value} suffix={suffix} />
                  </p>
                  <h3 className="font-bold text-white/80 text-lg mb-2">{label}</h3>
                  <p className="text-sm text-white/30 leading-relaxed">{desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          8. DASHBOARD PREVIEW
          ════════════════════════════════════════════════════════════════════ */}
      <Section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-indigo-400/80 uppercase">
            Dashboard
          </span>
          <h2 className="text-4xl md:text-5xl font-black mt-4 mb-6">
            See It In <span className="text-indigo-400">Action</span>
          </h2>
          <p className="text-white/30 max-w-xl mx-auto mb-12 text-lg">
            Real-time monitoring, predictive analytics, and smart maintenance — all in one view.
          </p>

          <motion.div
            className="relative rounded-2xl overflow-hidden border border-white/[0.08]"
            style={{
              background: 'linear-gradient(180deg, rgba(8,10,24,0.8), rgba(3,3,3,0.95))',
              boxShadow: '0 0 80px rgba(99,102,241,0.08), 0 40px 80px rgba(0,0,0,0.5)',
            }}
            whileInView={{ scale: [0.95, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Mock dashboard */}
            <div className="p-6 md:p-8">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Active Sensors', value: '32', color: '#6366f1' },
                  { label: 'Roads Monitored', value: '8', color: '#10b981' },
                  { label: 'Critical Alerts', value: '3', color: '#f43f5e' },
                  { label: 'Predicted Failures', value: '12', color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-[9px] text-white/20 uppercase tracking-wider font-bold mb-1">{label}</p>
                    <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Mock map area */}
              <div className="h-60 rounded-xl bg-[#0a0d1f] border border-white/[0.04] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <Road3DCanvas />
                </div>
                <div className="relative z-10 text-center">
                  <p className="text-white/40 text-sm font-medium mb-2">Interactive Live Map</p>
                  <Link
                    href="/"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600/80 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
                  >
                    Open Dashboard →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          9. VISION
          ════════════════════════════════════════════════════════════════════ */}
      <Section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/20 mb-8"
            whileInView={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <span className="text-3xl">🌏</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
            Building Infrastructure
            <br />
            That <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Thinks Ahead</span>
          </h2>

          <p className="text-lg text-white/30 max-w-2xl mx-auto leading-relaxed mb-4">
            We envision a world where no road fails unexpectedly. Where every crack is predicted, every pothole prevented,
            and every city runs on intelligent infrastructure.
          </p>
          <p className="text-base text-white/20 max-w-xl mx-auto leading-relaxed">
            NeuroPave isn&apos;t just a tool — it&apos;s the foundation for smarter, safer, sustainable cities.
          </p>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          10. FINAL CTA
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative">
        {/* Glow background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[800px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(ellipse, rgba(99,102,241,0.08), transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            className="text-4xl md:text-6xl font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Join the Future of
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Smart Infrastructure
            </span>
          </motion.h2>

          <motion.p
            className="text-lg text-white/30 mb-12 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Experience NeuroPave&apos;s AI-powered dashboard. See real-time predictions, live sensor data, and road intelligence.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/"
              className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold
                         shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50
                         hover:from-indigo-500 hover:to-emerald-500 transition-all duration-500 text-lg flex items-center gap-3"
            >
              <span>Try Live Demo</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="mailto:contact@neuropave.ai"
              className="px-10 py-5 rounded-2xl border border-white/10 text-white/50 font-bold text-lg
                         hover:border-white/25 hover:text-white/90 hover:bg-white/[0.03] transition-all duration-300"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════════════════ */}
      <footer className="py-10 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="text-white/40 text-sm font-medium">
              NeuroPave © {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-white/15 text-xs">
            AI-Powered Smart Road Infrastructure Platform — Built for Smart Bharat 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  );
}
