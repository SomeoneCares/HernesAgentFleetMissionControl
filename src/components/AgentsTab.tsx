import React, { useState } from 'react';
import { Agent, ModelOption, AgentMemoryItem } from '../types';
import { AVAILABLE_MODELS } from '../data/mockData';
import { useCluster } from '../context/ClusterContext';
import { DeployAgentModal } from './DeployAgentModal';
import { AgentDetailModal } from './AgentDetailModal';
import { AgentSoulModal } from './AgentSoulModal';
import { AgentMemoryModal } from './AgentMemoryModal';
import { CreateFleetModal } from './CreateFleetModal';
import { AgentPhotoModal } from './AgentPhotoModal';
import { 
  Bot, 
  Layers, 
  Cpu, 
  Zap, 
  Play, 
  Pause, 
  RefreshCw, 
  PlusCircle, 
  CheckCircle2, 
  Sliders, 
  Terminal, 
  HardDrive, 
  ShieldAlert, 
  FileText, 
  ExternalLink,
  ChevronDown,
  FileCode,
  Sparkles,
  Camera
} from 'lucide-react';

export const AgentsTab: React.FC = () => {
  const { 
    agents, 
    fleets,
    activeFleetId,
    setActiveFleetId,
    activeFleet,
    reassignAgentFleet,
    createFleet,
    setAgents, 
    updateAgentSoul, 
    updateAgentMemories, 
    changeAgentModel, 
    autoBalanceFleet, 
    killAgentTask, 
    deployAgent,
    showToast 
  } = useCluster();

  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isCreateFleetOpen, setIsCreateFleetOpen] = useState(false);
  const [fleetsPaused, setFleetsPaused] = useState(false);
  const [activeModalAgent, setActiveModalAgent] = useState<Agent | null>(null);
  const [modalMode, setModalMode] = useState<'logs' | 'memory' | 'sandbox' | 'terminal' | null>(null);
  const [soulModalAgent, setSoulModalAgent] = useState<Agent | null>(null);
  const [memoryModalAgent, setMemoryModalAgent] = useState<Agent | null>(null);
  const [photoModalAgent, setPhotoModalAgent] = useState<Agent | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAutoBalancing, setIsAutoBalancing] = useState(false);

  // Filter agents by active fleet
  const displayAgents = activeFleetId === 'all' 
    ? agents 
    : agents.filter(a => (a.fleetId || 'fleet-alpha-core') === activeFleetId);

  // Change model for an agent
  const handleModelChange = (agentId: string, newModelId: string) => {
    changeAgentModel(agentId, newModelId);
    const modelObj = AVAILABLE_MODELS.find(m => m.id === newModelId);
    if (modelObj) {
      setNotification(`Updated ${agentId} to ${modelObj.name} (${modelObj.throughputTps} tps)`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Save soul.md modifications
  const handleSaveSoul = (agentId: string, newSoul: string) => {
    updateAgentSoul(agentId, newSoul);
    setSoulModalAgent(null);
    setNotification(`Saved and hot-reloaded soul.md for ${agentId} — behavioral directives active.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Save memory modifications
  const handleSaveMemories = (agentId: string, updatedMemories: AgentMemoryItem[]) => {
    updateAgentMemories(agentId, updatedMemories);
    setNotification(`Updated neural memory repository for ${agentId} (${updatedMemories.length} records).`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Auto-balance task allocations
  const handleAutoBalance = () => {
    setIsAutoBalancing(true);
    setTimeout(() => {
      autoBalanceFleet();
      setIsAutoBalancing(false);
      setNotification(`Fleet re-balancing complete: Tensor pipeline load redistributed equally.`);
      setTimeout(() => setNotification(null), 4000);
    }, 500);
  };

  const handleDeployAgent = (newAgent: Agent) => {
    deployAgent(newAgent);
    setNotification(`Successfully initialized autonomous worker: ${newAgent.name}`);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleKillTask = (agentId: string) => {
    killAgentTask(agentId);
    setNotification(`Halted active task for ${agentId}. Execution context released.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-14">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-50 px-5 py-3.5 rounded-2xl bg-[#0c101a] border border-cyan-400/40 text-cyan-300 font-mono text-xs flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. HERO: FLEET WORKLOAD & TASK QUOTAS */}
      <section className="rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#4cd7f6]" />
              <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-medium">
                AUTONOMOUS FLEET CLUSTER
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Fleet Workload & Task Quotas</h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Active model weight allocations, neural context distribution, and distributed task queues
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <button
              onClick={handleAutoBalance}
              disabled={isAutoBalancing}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAutoBalancing ? 'animate-spin' : ''}`} />
              <span>Auto-Balance Tasks</span>
            </button>

            <button
              onClick={() => setFleetsPaused(!fleetsPaused)}
              className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                fleetsPaused
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08]'
              }`}
              type="button"
            >
              {fleetsPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
              <span>{fleetsPaused ? 'Resume Fleets' : 'Pause Fleets'}</span>
            </button>

            <button
              onClick={() => setIsDeployOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-95 text-[#07090e] font-bold shadow-[0_0_15px_rgba(76,215,246,0.3)] transition-all flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <PlusCircle className="w-4 h-4 text-[#07090e]" />
              <span>Deploy New Agent</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">ACTIVE AGENTS</span>
            <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
              {String(agents.length).padStart(2, '0')}
            </div>
            <span className="text-xs font-mono text-emerald-400 mt-1 block">100% operational</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">TASKS IN-PROGRESS</span>
            <div className="text-3xl font-extrabold text-cyan-300 mt-1 tracking-tight">
              {agents.reduce((acc, a) => acc + (a.activeTask ? 1 : 0) + a.assignedTasks.length, 0)}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-1 block">High concurrency</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">COMPLETED TODAY</span>
            <div className="text-3xl font-extrabold text-purple-300 mt-1 tracking-tight">
              142
            </div>
            <span className="text-xs font-mono text-purple-300/80 mt-1 block">+18 in last hour</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">BUFFER QUEUE</span>
            <div className="text-3xl font-extrabold text-slate-300 mt-1 tracking-tight">
              03
            </div>
            <span className="text-xs font-mono text-emerald-400 mt-1 block">Zero drop rate</span>
          </div>
        </div>
      </section>

      {/* 2. TASK SUMMARY CARD: TENSOR PIPELINE LOAD ALLOCATION */}
      <section className="rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-medium">TASK SUMMARY</span>
            <h3 className="text-lg font-bold text-white tracking-tight">Tensor Pipeline Load Allocation</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Aggregate Concurrency: <strong className="text-white">100% Allocated</strong>
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3.5 bg-white/[0.03] rounded-full overflow-hidden flex gap-1 p-0.5 border border-white/[0.06] mb-4">
          {agents.map((ag, i) => {
            const colors = ['bg-cyan-400', 'bg-purple-300', 'bg-emerald-400', 'bg-cyan-600', 'bg-indigo-400', 'bg-amber-400'];
            const color = colors[i % colors.length];
            return (
              <div
                key={ag.id}
                className={`h-full ${color} rounded-sm transition-all duration-500`}
                style={{ width: `${ag.allocationPercent}%` }}
                title={`${ag.name}: ${ag.allocationPercent}%`}
              />
            );
          })}
        </div>

        {/* Breakdown Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
          {agents.map((ag, i) => {
            const dotColors = ['bg-cyan-400', 'bg-purple-300', 'bg-emerald-400', 'bg-cyan-600', 'bg-indigo-400', 'bg-amber-400'];
            const dot = dotColors[i % dotColors.length];
            return (
              <div key={ag.id} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-slate-300">{ag.name} <strong className="text-white font-medium">{ag.allocationPercent}%</strong></span>
              </div>
            );
          })}
        </div>
      </section>

      {/* FLEET SELECTION & HOST PARTITION CONTROL BAR */}
      <div className="rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
              Host Server Fleet Partitions
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
              Multi-Fleet Host
            </span>
          </div>

          <button
            onClick={() => setIsCreateFleetOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-medium flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
            type="button"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Partition New Fleet</span>
          </button>
        </div>

        {/* Fleet Tabs Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
          <button
            onClick={() => setActiveFleetId('all')}
            className={`px-3.5 py-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
              activeFleetId === 'all'
                ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(76,215,246,0.3)] font-bold'
                : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            Federated View (All {agents.length} Agents)
          </button>
          {fleets.map(fleet => {
            const fleetAgentCount = agents.filter(a => (a.fleetId || 'fleet-alpha-core') === fleet.id).length;
            const isSelected = activeFleetId === fleet.id;
            return (
              <button
                key={fleet.id}
                onClick={() => setActiveFleetId(fleet.id)}
                className={`px-3.5 py-2 rounded-xl border transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(76,215,246,0.3)] font-bold'
                    : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fleet.color }} />
                <span>{fleet.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-slate-300">
                  {fleetAgentCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Fleet Details Spec Pill (if single fleet selected) */}
        {activeFleet && activeFleetId !== 'all' && (
          <div className="pt-3 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Codename / Purpose</span>
              <span className="text-white font-medium truncate block">{activeFleet.codename}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Host Cluster Node</span>
              <span className="text-cyan-300 font-medium truncate block">{activeFleet.nodeCluster}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">VRAM Headroom</span>
              <span className="text-purple-300 font-medium truncate block">{activeFleet.vramAllocated}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Default Engine</span>
              <span className="text-emerald-300 font-medium truncate block">{activeFleet.defaultModelId}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. AGENT CARDS GRID */}
      {displayAgents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#101622]/65 border border-white/[0.08] flex flex-col items-center justify-center gap-3 font-mono text-xs text-slate-400">
          <Bot className="w-8 h-8 text-slate-600 mb-1" />
          <p className="text-slate-300 font-bold text-sm">No autonomous agents currently assigned to this fleet partition.</p>
          <p className="text-slate-500 max-w-md">You can deploy a new agent directly into this partition or switch to Federated View to relocate existing workers.</p>
          <button
            onClick={() => setIsDeployOpen(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/30 transition-all font-bold cursor-pointer"
          >
            Deploy Agent to this Fleet
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayAgents.map((agent) => {
            const currentModel = AVAILABLE_MODELS.find(m => m.id === agent.activeModelId) || AVAILABLE_MODELS[0];
            const contextPercent = Math.round((agent.contextUsed / agent.contextTotal) * 100);
            const agentFleet = fleets.find(f => f.id === (agent.fleetId || 'fleet-alpha-core'));

            return (
              <div
                key={agent.id}
                className="flex flex-col justify-between rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.18] transition-all duration-300 group"
              >
                <div>
                  {/* Top Row: Name, Codename, Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPhotoModalAgent(agent)}
                        className="relative w-12 h-12 rounded-xl overflow-hidden border border-cyan-400/30 group-hover:border-cyan-400/70 bg-slate-900 shrink-0 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 group/photo"
                        title="Click to change profile portrait photo"
                      >
                        {agent.avatarPhoto ? (
                          <img
                            src={agent.avatarPhoto}
                            alt={agent.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                            <span className="material-symbols-outlined text-2xl">{agent.avatarIcon}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-cyan-300">
                          <Camera className="w-4 h-4" />
                        </div>
                      </button>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight leading-snug flex items-center gap-1.5">
                          {agent.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-400">{agent.codename}</span>
                      </div>
                    </div>

                    <span className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                      agent.status === 'ONLINE'
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/25'
                        : agent.status === 'BUSY'
                        ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/25'
                        : agent.status === 'MONITORING'
                        ? 'bg-purple-400/10 text-purple-300 border-purple-400/25'
                        : agent.status === 'GUARD ACTIVE'
                        ? 'bg-rose-400/10 text-rose-400 border-rose-400/25'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                    }`}>
                      {agent.status}
                    </span>
                  </div>

                  {/* Fleet Partition Tag & Fast Relocation Selector */}
                  <div className="flex items-center justify-between gap-2 mb-4 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="text-slate-400">Fleet:</span>
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: agentFleet?.color || '#4cd7f6' }} />
                        <span className="truncate max-w-[110px]">{agentFleet?.name || 'Core Fleet'}</span>
                      </span>
                    </div>
                    <select
                      value={agent.fleetId || 'fleet-alpha-core'}
                      onChange={(e) => reassignAgentFleet(agent.id, e.target.value)}
                      className="bg-[#141c2c] border border-white/[0.1] text-slate-300 text-[10px] px-2 py-0.5 rounded cursor-pointer hover:border-cyan-400/40 focus:outline-none"
                      title="Relocate agent to another fleet partition on this host"
                    >
                      {fleets.map(f => (
                        <option key={f.id} value={f.id}>
                          Move: {f.codename}
                        </option>
                      ))}
                    </select>
                  </div>

                {/* Role Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-5 min-h-[36px]">
                  {agent.role}
                </p>

                {/* ACTIVE INFERENCE ENGINE (Interactive Model Switcher) */}
                <div className="mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase">
                      <Cpu className="w-3.5 h-3.5" />
                      Active Inference Engine
                    </span>
                    <span className="text-slate-400">{agent.latencyLabel}</span>
                  </div>

                  <div className="relative">
                    <select
                      value={agent.activeModelId}
                      onChange={(e) => handleModelChange(agent.id, e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[#141c2c] border border-white/[0.1] text-xs font-mono text-white font-medium focus:border-cyan-400 focus:outline-none cursor-pointer hover:border-white/[0.2] transition-colors"
                    >
                      {AVAILABLE_MODELS.map(m => (
                        <option key={m.id} value={m.id} className="bg-[#101622] text-white">
                          {m.name} ({m.throughputTps} tps)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Context Usage Gauge */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-400">Context Usage</span>
                    <span className="text-white font-semibold">
                      {agent.contextUsed.toLocaleString()} <span className="text-slate-400 font-normal">/ {(agent.contextTotal / 1000).toFixed(0)}k ({contextPercent}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-white/[0.03]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        contextPercent > 70
                          ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                          : 'bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(76,215,246,0.3)]'
                      }`}
                      style={{ width: `${contextPercent}%` }}
                    />
                  </div>
                </div>

                {/* Active Task or Queue */}
                <div className="mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs font-mono">
                  {agent.activeTask ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          ACTIVE TASK {agent.activeTask.pid ? `PID:${agent.activeTask.pid}` : ''}
                        </span>
                        {agent.activeTask.progress && (
                          <span className="text-slate-300 font-bold">{agent.activeTask.progress}%</span>
                        )}
                      </div>
                      <div className="text-white truncate font-medium">{agent.activeTask.title}</div>
                      {agent.activeTask.fileOrSource && (
                        <div className="text-slate-400 text-[11px] truncate mt-0.5">{agent.activeTask.fileOrSource}</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-400 text-[11px] uppercase block mb-1">Assigned Task Queue</span>
                      <div className="text-slate-300 truncate">
                        {agent.assignedTasks[0]?.title || 'Standing by for orchestration loop'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Memory Architecture Subsystem Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {agent.memoryArchitecture.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Drawer Buttons */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* EDIT SOUL.MD BUTTON */}
                  <button
                    onClick={() => setSoulModalAgent(agent)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 hover:text-cyan-200 border border-cyan-400/30 transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(76,215,246,0.25)]"
                    type="button"
                    title="Edit agent's soul.md directives and cognitive manifesto"
                  >
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>soul.md</span>
                  </button>

                  {/* SEARCHABLE NEURAL MEMORY REPOSITORY (NO JSON) */}
                  <button
                    onClick={() => setMemoryModalAgent(agent)}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/30 transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                    type="button"
                    title="Search, inspect, and edit agent memories without native JSON"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                    <span>Memory</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalAgent(agent);
                      setModalMode('logs');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/[0.06] transition-colors"
                    type="button"
                    title="View Agent Logs"
                  >
                    Logs
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalAgent(agent);
                      setModalMode('sandbox');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/[0.06] transition-colors hidden sm:inline-flex"
                    type="button"
                    title="Check Sandbox Policy"
                  >
                    Sandbox
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalAgent(agent);
                      setModalMode('terminal');
                    }}
                    className="px-2 py-1.5 rounded-lg bg-white/[0.03] hover:bg-cyan-400/10 hover:text-cyan-400 border border-white/[0.06] transition-colors"
                    type="button"
                    title="Agent Shell"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {agent.activeTask && (
                  <button
                    onClick={() => handleKillTask(agent.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    type="button"
                    title="Halt & Kill Current Task"
                  >
                    Kill Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
      )}

      {/* Deploy Agent Modal */}
      <DeployAgentModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        onDeploy={handleDeployAgent}
      />

      {/* Detail / Logs / Sandbox / Terminal Modal */}
      <AgentDetailModal
        agent={activeModalAgent}
        mode={modalMode}
        onClose={() => {
          setActiveModalAgent(null);
          setModalMode(null);
        }}
        onOpenMemoryManager={() => {
          if (activeModalAgent) {
            const ag = activeModalAgent;
            setActiveModalAgent(null);
            setModalMode(null);
            setMemoryModalAgent(ag);
          }
        }}
      />

      {/* Dedicated Agent SOUL.md Editor Modal */}
      <AgentSoulModal
        agent={soulModalAgent}
        isOpen={!!soulModalAgent}
        onClose={() => setSoulModalAgent(null)}
        onSave={handleSaveSoul}
      />

      {/* Dedicated Agent Memory Search & Management Modal (Zero Native JSON) */}
      <AgentMemoryModal
        agent={memoryModalAgent}
        isOpen={!!memoryModalAgent}
        onClose={() => setMemoryModalAgent(null)}
        onSaveMemories={handleSaveMemories}
      />

      {/* Dedicated Agent Photo Customizer Modal */}
      <AgentPhotoModal
        agent={photoModalAgent}
        isOpen={!!photoModalAgent}
        onClose={() => setPhotoModalAgent(null)}
      />

      {/* Provision New Fleet Modal */}
      <CreateFleetModal
        isOpen={isCreateFleetOpen}
        onClose={() => setIsCreateFleetOpen(false)}
        onCreateFleet={(newFleet) => {
          createFleet(newFleet);
          setIsCreateFleetOpen(false);
        }}
      />
    </div>
  );
};
