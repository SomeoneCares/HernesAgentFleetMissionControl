import React from 'react';
import { Agent } from '../types';
import { getAgentMemories } from '../data/agentMemorySoulData';
import { X, Terminal, Cpu, HardDrive, ShieldCheck, Bug, Check, Search, ExternalLink, Sparkles } from 'lucide-react';

interface AgentDetailModalProps {
  agent: Agent | null;
  mode: 'logs' | 'memory' | 'sandbox' | 'terminal' | null;
  onClose: () => void;
  onOpenMemoryManager?: () => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ 
  agent, 
  mode, 
  onClose,
  onOpenMemoryManager 
}) => {
  if (!agent || !mode) return null;

  const memoriesList = getAgentMemories(agent.id, agent.memories);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1320] border border-white/[0.14] p-6 shadow-2xl font-mono text-xs max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              {mode === 'logs' && <Terminal className="w-4 h-4" />}
              {mode === 'memory' && <HardDrive className="w-4 h-4" />}
              {mode === 'sandbox' && <ShieldCheck className="w-4 h-4" />}
              {mode === 'terminal' && <Terminal className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white uppercase">{agent.name} // {mode.toUpperCase()}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  {agent.codename}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{agent.role}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {mode === 'logs' && (
            <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-slate-300 leading-relaxed text-xs space-y-2">
              <div className="text-cyan-400">[14:32:01.092] SYSTEM_INIT :: Initialized context block index for {agent.name}</div>
              <div className="text-slate-400">[14:32:04.144] VLLM_TENSOR :: Paged attention window mapped: {agent.contextUsed} / {agent.contextTotal} tokens</div>
              <div className="text-emerald-400">[14:32:08.891] TOOL_EXEC :: Registered tool matrix: {agent.tools.join(', ')}</div>
              <div className="text-slate-300">[14:32:15.220] KERNEL_HEALTH :: Temperature 58.4°C, NVLink interconnect nominal at 900 GB/s</div>
              <div className="text-purple-300">[14:32:22.401] TASK_CYCLE :: Active pipeline synchronized with master consensus quorum</div>
            </div>
          )}

          {mode === 'memory' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Neural Memory Index ({memoriesList.length} Verified Records)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Search, filter, edit, and inject memory units without native JSON.
                  </p>
                </div>
                {onOpenMemoryManager && (
                  <button
                    type="button"
                    onClick={onOpenMemoryManager}
                    className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Open Memory Search</span>
                  </button>
                )}
              </div>

              {/* Memory List preview */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Memory Records:</div>
                {memoriesList.map((mem) => (
                  <div key={mem.id} className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-400/10 text-purple-300 border border-purple-400/20 font-semibold">
                          {mem.category}
                        </span>
                        <span className="text-[10px] text-amber-300">★ {mem.importance.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500">• {mem.tokenCount} tokens</span>
                      </div>
                      <div className="text-white font-bold text-xs">{mem.title}</div>
                      <div className="text-slate-300 text-[11px] font-sans mt-1 line-clamp-2">{mem.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'sandbox' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <div>
                  <div className="font-bold text-sm">GVISOR SANDBOX ISOLATION ACTIVE</div>
                  <div className="text-xs text-emerald-400/80">Kernel system call interception: ptrace / seccomp enabled. Zero host privilege breakout permitted.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Filesystem Root:</span>
                  <span className="text-white">/sandbox/ephemeral/{agent.id} (OverlayFS)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Network Outbound:</span>
                  <span className="text-white">Whitelisted Gateway API Only (mTLS)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Process Memory Cap:</span>
                  <span className="text-white">64.0 GB Hard Cgroup Limit</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'terminal' && (
            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] text-xs font-mono space-y-3">
              <div className="text-slate-400">Hermes Autonomous Agent Interactive Debug Shell v4.2</div>
              <div className="text-cyan-400">{agent.codename} &gt; status --verbose</div>
              <div className="text-slate-300">STATUS: {agent.status} | MODEL: {agent.activeModelId} | LATENCY: {agent.latencyLabel}</div>
              <div className="text-cyan-400">{agent.codename} &gt; ping --cluster-core</div>
              <div className="text-emerald-400">64 bytes from cluster.internal: icmp_seq=1 ttl=64 time=0.412 ms</div>
              <div className="flex items-center gap-2 text-white pt-2">
                <span className="text-cyan-400">&gt;</span>
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-white/[0.06] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white transition-all text-xs font-medium"
            type="button"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
