import React, { useState } from 'react';
import { Agent, ModelOption } from '../types';
import { AVAILABLE_MODELS } from '../data/mockData';
import { X, Sparkles, Cpu, Shield, PlusCircle } from 'lucide-react';

interface DeployAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (newAgent: Agent) => void;
}

export const DeployAgentModal: React.FC<DeployAgentModalProps> = ({ isOpen, onClose, onDeploy }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [contextSize, setContextSize] = useState('64k');
  const [memoryType, setMemoryType] = useState('Shared Vector RAG');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const modelObj = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: name.trim(),
      codename: `Agent-${Math.floor(10 + Math.random() * 90)} // Custom Worker`,
      role: role.trim(),
      status: 'ONLINE',
      statusColor: 'tertiary',
      avatarIcon: 'smart_toy',
      description: role.trim(),
      activeModelId: modelObj.id,
      latencyLabel: `${modelObj.latencyMs}ms • ${modelObj.tag}`,
      contextUsed: 1024,
      contextTotal: contextSize === '128k' ? 128000 : 64000,
      uptime: 'Just deployed',
      slasHealth: '100% Nominal',
      memoryArchitecture: [memoryType, 'Temp: 0.20', 'Containerized'],
      assignedTasks: [
        { id: `#${Math.floor(1000 + Math.random() * 9000)}`, title: 'Initialized neural weights & handshake', active: true }
      ],
      tools: ['hermes_api_proxy', 'dynamic_context_evaluator'],
      allocationPercent: 10
    };

    onDeploy(newAgent);
    setName('');
    setRole('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e131f] border border-white/[0.14] p-6 shadow-2xl font-mono text-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-wide">DEPLOY AUTONOMOUS AGENT</h3>
              <p className="text-[11px] text-slate-400">Initialize a new specialized intelligence worker node</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Agent Designator / Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., DocuSynthesizer, VectorScout, ApiArchitect..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Operational Role & Directive</label>
            <textarea
              required
              rows={3}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Describe primary responsibilities, evaluation metrics, and target repositories..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Initial Inference Engine</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141b2b] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
              >
                {AVAILABLE_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Context Window Allocation</label>
              <select
                value={contextSize}
                onChange={(e) => setContextSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141b2b] border border-white/[0.1] text-white focus:border-cyan-400 focus:outline-none text-xs"
              >
                <option value="32k">32k Tokens (Fast)</option>
                <option value="64k">64k Tokens (Balanced)</option>
                <option value="128k">128k Tokens (Deep Spec)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-medium">Memory Architecture Subsystem</label>
            <div className="grid grid-cols-2 gap-2">
              {['Shared Vector RAG', 'Ephemeral In-Memory KV', 'Long-Term ClickHouse', 'Sandboxed Redis'].map((mem) => (
                <button
                  type="button"
                  key={mem}
                  onClick={() => setMemoryType(mem)}
                  className={`px-3 py-2 rounded-xl text-left border transition-all ${
                    memoryType === mem
                      ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300 font-medium'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  {mem}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#07090e] font-bold shadow-[0_0_15px_rgba(76,215,246,0.3)] hover:opacity-95 cursor-pointer"
            >
              Confirm Deployment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
