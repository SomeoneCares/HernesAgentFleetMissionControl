import React, { useState } from 'react';
import { ActivityEvent, TabType } from '../types';
import { useCluster } from '../context/ClusterContext';
import { 
  Cpu, 
  Network, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ExternalLink, 
  Terminal, 
  TrendingUp, 
  Server,
  Lock,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface OverviewTabProps {
  onNavigateTab?: (tab: TabType) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const { events, setEvents } = useCluster();
  const [activeFilter, setActiveFilter] = useState<string>('All Events');
  const [commandInput, setCommandInput] = useState<string>('');
  const [commandOutput, setCommandOutput] = useState<string | null>(null);

  // Filter events
  const filteredEvents = events.filter(evt => {
    if (activeFilter === 'All Events') return true;
    if (activeFilter === 'Agent Actions') return evt.category === 'AGENT';
    if (activeFilter === 'Tool Executions') return evt.category === 'TOOL' || evt.text.includes('Tool');
    if (activeFilter === 'Gateway Alerts') return evt.category === 'GATEWAY' || evt.category === 'MODEL';
    if (activeFilter === 'Model Swaps') return evt.text.toLowerCase().includes('swap') || evt.text.toLowerCase().includes('model');
    return true;
  });

  const handleExecuteCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim().toLowerCase();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    let newEvent: ActivityEvent = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      agent: 'Operator: CLI',
      category: 'TOOL',
      text: `Manual command execution: "${commandInput}"`,
      status: 'EXECUTED',
      statusType: 'success'
    };

    if (cmd.includes('scale') || cmd.includes('gpu')) {
      newEvent.text = `Autoscale adjustment triggered: Node-02 allocation optimized +15%`;
      newEvent.status = 'SUCCESS (112ms)';
      setCommandOutput(`Scale command acknowledged. Distributed 15% load to GPU Node-02.`);
    } else if (cmd.includes('cache') || cmd.includes('flush')) {
      newEvent.text = `KV Cache flush broadcasted to all active worker pods`;
      newEvent.status = 'SAVED 22.4k TOKENS';
      newEvent.statusType = 'saved';
      setCommandOutput(`KV Cache flushed. 22,400 tokens purged from ephemeral buffer.`);
    } else if (cmd.includes('model') || cmd.includes('swap')) {
      newEvent.text = `Hot-swap request for model weights scheduled across US-EAST-01`;
      newEvent.status = 'DISPATCHED';
      setCommandOutput(`Model weights swap initialized. Route priority: FP8 Kernels.`);
    } else {
      setCommandOutput(`Command "${commandInput}" verified and dispatched to telemetry bus.`);
    }

    setEvents([newEvent, ...events]);
    setCommandInput('');
    setTimeout(() => setCommandOutput(null), 4500);
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* 1. TOP HERO: STREAMLINED LUXURY COMMAND BAR (3-PILLAR BREATHEABLE STRIP) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Compute & GPU Cluster Fabric */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-all duration-300">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">Dual H100 SXM5</h2>
                <span className="text-sm font-semibold text-white">Compute Topology</span>
              </div>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-cyan-300 border border-cyan-400/20">
              NVLink 900 GB/s
            </span>
          </div>

          {/* GPU Pair Telemetry Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#4cd7f6]" />
                  Node #01 • 61°C
                </span>
                <span className="font-semibold text-white">62.4 GB <span className="text-slate-400 font-normal">/ 80GB (78%)</span></span>
              </div>
              <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-white/[0.03]">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full shadow-[0_0_12px_rgba(76,215,246,0.4)] transition-all duration-700" 
                  style={{ width: '78%' }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_#d0bcff]" />
                  Node #02 • 56°C
                </span>
                <span className="font-semibold text-white">51.2 GB <span className="text-slate-400 font-normal">/ 80GB (64%)</span></span>
              </div>
              <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-white/[0.03]">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-300 rounded-full shadow-[0_0_12px_rgba(208,188,255,0.4)] transition-all duration-700" 
                  style={{ width: '64%' }} 
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>AMD EPYC 64-CORE: <strong className="text-white font-medium">42%</strong></span>
            <span>DDR5 RAM: <strong className="text-white font-medium">218/512 GB</strong></span>
          </div>
        </div>

        {/* Column 2: Gateway Latency & Throughput Stream */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-all duration-300">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">AI Gateway</h2>
                <span className="text-sm font-semibold text-white">Real-Time Ingress Flow</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              HTTP/3 ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="block text-[11px] font-mono text-slate-400 mb-1">AVG LATENCY</span>
              <span className="text-2xl font-bold text-white tracking-tight">14.2<span className="text-xs font-mono text-slate-400 font-normal">ms</span></span>
              <span className="block text-[11px] font-mono text-emerald-400 mt-1">-2.1ms (faster)</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="block text-[11px] font-mono text-slate-400 mb-1">STREAMS</span>
              <span className="text-2xl font-bold text-white tracking-tight">42</span>
              <span className="block text-[11px] font-mono text-purple-300 mt-1">WebSocket</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="block text-[11px] font-mono text-slate-400 mb-1">INGRESS</span>
              <span className="text-2xl font-bold text-white tracking-tight">2.4<span className="text-xs font-mono text-slate-400 font-normal">k</span></span>
              <span className="block text-[11px] font-mono text-slate-400 mt-1">req/sec</span>
            </div>
          </div>

          {/* Glowing Micro-Sparkline */}
          <div className="relative h-11 w-full pt-1">
            <svg className="w-full h-full text-cyan-400 overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 45">
              <defs>
                <linearGradient id="glowGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 35 Q 30 20, 60 28 T 120 12 T 180 22 T 240 8 T 300 14 L 300 45 L 0 45 Z" fill="url(#glowGrad)" />
              <path d="M0 35 Q 30 20, 60 28 T 120 12 T 180 22 T 240 8 T 300 14" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Column 3: Global System Uptime & Model Heartbeat */}
        <div className="relative overflow-hidden rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.16] transition-all duration-300">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/25 flex items-center justify-center text-purple-300">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">System Uptime</h2>
                <span className="text-sm font-semibold text-white">99.98% Service SLA</span>
              </div>
            </div>
            <span className="font-mono text-xs text-slate-400">SYNC: 1.0s</span>
          </div>

          {/* Heartbeat Matrix List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4edea3]" />
                <span className="text-white font-medium">Hermes 3 405B</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-semibold">18ms</span>
                <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-400/10 font-bold">ONLINE</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4edea3]" />
                <span className="text-white font-medium">Hermes 2 Pro 70B</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-semibold">9ms</span>
                <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-400/10 font-bold">ONLINE</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4edea3]" />
                <span className="text-white font-medium">Llama 3.3 70B</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-semibold">21ms</span>
                <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-400/10 font-bold">ONLINE</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>Mistral Large 2</span>
              </div>
              <div className="flex items-center gap-3">
                <span>--</span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.05]">STANDBY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MIDDLE ROW: EXECUTIVE INFERENCE LEDGER & PIPELINES/GUARDRAILS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* INFERENCE LEDGER (8 cols) */}
        <section className="xl:col-span-8 rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          {/* Header & Executive Highlight */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#4cd7f6]" />
                <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-medium">
                  REAL-TIME EXPENSES & TOKENS
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">Inference Ledger & Global Burn</h3>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.03] border border-emerald-400/20 px-4 py-2.5 rounded-xl">
              <span className="material-symbols-outlined text-emerald-400 text-lg">eco</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider leading-none">
                  Cache Savings
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  +$412.00<span className="text-xs font-normal text-slate-400">/hr</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 Key Executive Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-white/[0.06]">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">TOTAL CONSUMED</span>
              <div className="text-3xl font-extrabold text-white mt-1.5 tracking-tight">
                142.9<span className="text-lg text-cyan-400 font-mono">M</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 mt-1">
                <TrendingUp className="w-3 h-3" /> +14.2% today
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">INPUT PROMPT</span>
              <div className="text-3xl font-extrabold text-slate-200 mt-1.5 tracking-tight">
                94.2<span className="text-lg text-slate-400 font-mono">M</span>
              </div>
              <span className="text-xs font-mono text-slate-400 mt-1 block">65.9% total share</span>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">OUTPUT TOKENS</span>
              <div className="text-3xl font-extrabold text-purple-300 mt-1.5 tracking-tight">
                48.6<span className="text-lg text-purple-300/70 font-mono">M</span>
              </div>
              <span className="text-xs font-mono text-slate-400 mt-1 block">34.1% generation</span>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">CACHE HIT RATE</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1.5 tracking-tight">
                68.4<span className="text-lg text-emerald-400/70 font-mono">%</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 mt-1 block">Optimal efficiency</span>
            </div>
          </div>

          {/* Gradient Allocation Bar */}
          <div className="py-6 border-b border-white/[0.06]">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2.5">
              <span className="tracking-wider uppercase">Model Capacity Distribution</span>
              <span className="text-slate-300">100% Balanced Load</span>
            </div>
            <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden flex gap-1 p-0.5 border border-white/[0.05]">
              <div className="h-full bg-cyan-400 rounded-l-full shadow-[0_0_10px_#4cd7f6] transition-all duration-500" style={{ width: '47.8%' }} title="Hermes 3 405B (47.8%)" />
              <div className="h-full bg-purple-300 shadow-[0_0_10px_#d0bcff] transition-all duration-500" style={{ width: '33.7%' }} title="Hermes 2 Pro (33.7%)" />
              <div className="h-full bg-emerald-400 shadow-[0_0_10px_#4edea3] transition-all duration-500" style={{ width: '13.4%' }} title="Llama 3.3 (13.4%)" />
              <div className="h-full bg-cyan-600 rounded-r-full transition-all duration-500" style={{ width: '5.1%' }} title="Qwen 2.5 (5.1%)" />
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#4cd7f6]" />
                <span className="text-slate-300">Hermes 3 405B <strong className="text-white">47.8%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_8px_#d0bcff]" />
                <span className="text-slate-300">Hermes 2 Pro <strong className="text-white">33.7%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4edea3]" />
                <span className="text-slate-300">Llama 3.3 70B <strong className="text-white">13.4%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-600" />
                <span className="text-slate-300">Qwen 2.5 Coder <strong className="text-white">5.1%</strong></span>
              </div>
            </div>
          </div>

          {/* Telemetry Table */}
          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/[0.05]">
                  <th className="py-3 font-medium tracking-wider uppercase">DEPLOYED MODEL</th>
                  <th className="py-3 font-medium tracking-wider uppercase">TOKENS TODAY</th>
                  <th className="py-3 font-medium tracking-wider uppercase">THROUGHPUT</th>
                  <th className="py-3 font-medium tracking-wider uppercase">DAILY SPEND</th>
                  <th className="py-3 font-medium tracking-wider uppercase text-right">SUCCESS RATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <tr className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span>Hermes 3 405B Instruct</span>
                  </td>
                  <td className="py-4 text-slate-300">68.4M <span className="text-slate-400">(47.8%)</span></td>
                  <td className="py-4 text-cyan-400 font-semibold">42.1 tps</td>
                  <td className="py-4 font-semibold text-white">$136.80</td>
                  <td className="py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-semibold border border-emerald-400/20">99.9%</span>
                  </td>
                </tr>

                <tr className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-300">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span>Hermes 2 Pro 70B</span>
                  </td>
                  <td className="py-4 text-slate-300">48.2M <span className="text-slate-400">(33.7%)</span></td>
                  <td className="py-4 text-purple-300 font-semibold">88.4 tps</td>
                  <td className="py-4 font-semibold text-white">$48.20</td>
                  <td className="py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-semibold border border-emerald-400/20">100.0%</span>
                  </td>
                </tr>

                <tr className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                      <Server className="w-3.5 h-3.5" />
                    </div>
                    <span>Llama 3.3 70B Groq/vLLM</span>
                  </td>
                  <td className="py-4 text-slate-300">19.1M <span className="text-slate-400">(13.4%)</span></td>
                  <td className="py-4 text-emerald-400 font-semibold">112.0 tps</td>
                  <td className="py-4 font-semibold text-white">$15.28</td>
                  <td className="py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-semibold border border-emerald-400/20">99.8%</span>
                  </td>
                </tr>

                <tr className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/15 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <span>Qwen 2.5 Coder 32B</span>
                  </td>
                  <td className="py-4 text-slate-300">7.1M <span className="text-slate-400">(5.1%)</span></td>
                  <td className="py-4 text-cyan-300 font-semibold">94.6 tps</td>
                  <td className="py-4 font-semibold text-white">$5.68</td>
                  <td className="py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-semibold border border-emerald-400/20">100.0%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SIDEBAR: ACTIVE PIPELINES & GUARDRAILS (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          {/* Active Pipelines */}
          <section className="rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <span className="font-mono text-xs tracking-widest text-purple-300 uppercase font-medium">ORCHESTRATION</span>
                <h4 className="text-lg font-bold text-white tracking-tight">Active Pipelines</h4>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                3 Queued / Running
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {/* Pipeline 1 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-cyan-400/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Bug Fixer Autonomous #409</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">64%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 rounded-full shadow-[0_0_8px_#4cd7f6]" style={{ width: '64%' }} />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Branch: hermes-patch-881</span>
                  <span className="text-slate-300">4 agents active</span>
                </div>
              </div>

              {/* Pipeline 2 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-purple-400/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Multi-Agent Consensus</span>
                  <span className="font-mono text-xs font-bold text-purple-300">Step 3 / 5</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-purple-300 rounded-full shadow-[0_0_8px_#d0bcff]" style={{ width: '60%' }} />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Semantic delta check</span>
                  <span className="text-purple-300">Quorum voting</span>
                </div>
              </div>

              {/* Pipeline 3 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] opacity-70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Nightly Telemetry Archival</span>
                  <span className="font-mono text-xs text-slate-400">QUEUED</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }} />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Scheduled 02:00:00 UTC</span>
                  <span>S3 Cold Sync</span>
                </div>
              </div>
            </div>
          </section>

          {/* Guardrails & Sandboxing */}
          <section className="rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-medium">SECURITY PROTOCOL</span>
                <h4 className="text-lg font-bold text-white tracking-tight">Guardrails & Sandbox</h4>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                STRICT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">VIOLATIONS TODAY</span>
                <span className="text-2xl font-bold text-emerald-400">0</span>
                <span className="text-[11px] font-mono text-slate-400 block mt-1">Zero flags triggered</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">COMPLIANCE RATE</span>
                <span className="text-2xl font-bold text-white">99.99%</span>
                <span className="text-[11px] font-mono text-slate-400 block mt-1">Llama Guard v3</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">gVisor Runtime Sandbox</span>
                  <span className="text-[11px] font-mono text-slate-400">Zero host privilege breakout</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                ISOLATED
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: CYBERNETIC ACTIVITY AUDIT STREAM */}
      <section className="rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        {/* Stream Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <span className="material-symbols-outlined text-xl">stream</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xl font-bold text-white tracking-tight">Cybernetic Activity Stream</h3>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  12 events/sec
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">Deterministic trace logs and multi-agent operations</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {['All Events', 'Agent Actions', 'Tool Executions', 'Gateway Alerts', 'Model Swaps'].map((filterName) => (
              <button
                key={filterName}
                onClick={() => setActiveFilter(filterName)}
                className={`px-3.5 py-1.5 rounded-xl border transition-all ${
                  activeFilter === filterName
                    ? 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30 font-medium'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border-white/[0.08]'
                }`}
                type="button"
              >
                {filterName}
              </button>
            ))}
          </div>
        </div>

        {/* Command Output Banner if any */}
        {commandOutput && (
          <div className="my-3 px-4 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{commandOutput}</span>
          </div>
        )}

        {/* Event Rows */}
        <div className="divide-y divide-white/[0.03] py-2">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono group hover:bg-white/[0.02] px-3 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-slate-400 shrink-0">{evt.timestamp}</span>
                <span className={`px-2.5 py-1 rounded-md font-medium shrink-0 border ${
                  evt.category === 'AGENT'
                    ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
                    : evt.category === 'MODEL'
                    ? 'bg-purple-400/10 text-purple-300 border-purple-400/20'
                    : evt.category === 'SECURITY'
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                    : 'bg-white/[0.06] text-slate-300 border-white/[0.1]'
                }`}>
                  {evt.category}: {evt.agent}
                </span>
                <span className="text-slate-200 truncate">
                  {evt.text}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className={`font-semibold ${
                  evt.statusType === 'saved'
                    ? 'text-emerald-400'
                    : evt.statusType === 'success'
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}>
                  {evt.status}
                </span>
                <button 
                  className="text-slate-400 hover:text-cyan-400 transition-colors p-1" 
                  type="button"
                  title="Inspect trace payload"
                  onClick={() => alert(`Trace ID: ${evt.id}\nTimestamp: ${evt.timestamp}\nDetail: ${evt.text}`)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal Command Prompt Bar */}
        <form onSubmit={handleExecuteCommand} className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] text-cyan-400 border border-white/[0.06] shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-cyan-400/50 rounded-xl px-4 py-2.5 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
            placeholder="Enter query filter, regex grep, or Hermes agent command (e.g., 'scale-gpu', 'flush-cache', 'swap-model')..."
            type="text"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-90 text-[#07090e] font-mono text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(76,215,246,0.3)] transition-all shrink-0 cursor-pointer"
          >
            EXECUTE
          </button>
        </form>
      </section>
    </div>
  );
};
