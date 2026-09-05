import React, { useState } from 'react';
import { Fleet } from '../types';
import { AVAILABLE_MODELS } from '../data/mockData';
import { X, Server, Layers, Cpu, Shield, Sparkles, PlusCircle } from 'lucide-react';

interface CreateFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newFleet: Fleet) => void;
}

export const CreateFleetModal: React.FC<CreateFleetModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [codename, setCodename] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState<Fleet['purpose']>('Core Production');
  const [nodeCluster, setNodeCluster] = useState('node-01.us-east.h100 (80GB SXM5)');
  const [vramAllocated, setVramAllocated] = useState('32.0 / 80 GB');
  const [defaultModelId, setDefaultModelId] = useState(AVAILABLE_MODELS[0].id);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!codename || codename.startsWith('FLEET-')) {
      const slug = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 16);
      if (slug) {
        setCodename(`FLEET-${slug}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `fleet-${Date.now().toString(36)}`;
    const colorMap: Record<string, string> = {
      'Core Production': '#00f2fe',
      'Autonomous Dev & Code': '#10b981',
      'Research & Synthesis': '#a855f7',
      'Security & Infrastructure': '#ef4444',
      'Custom Swarm': '#f59e0b'
    };

    const newFleet: Fleet = {
      id,
      name: name.trim(),
      codename: codename.trim() || `FLEET-${Date.now().toString(36).toUpperCase()}`,
      description: description.trim() || 'Partitioned multi-agent autonomous fleet hosted on local Hermes server.',
      purpose,
      status: 'ACTIVE',
      nodeCluster,
      vramAllocated,
      defaultModelId,
      color: colorMap[purpose] || '#00f2fe'
    };

    onCreate(newFleet);
    setName('');
    setCodename('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c101a] border border-white/[0.12] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] font-mono text-xs text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Partition New Fleet on Host
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-semibold uppercase tracking-wider">
                  HERMES HOST
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Deploy an isolated agent fleet partition sharing this Hermes server instance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fleet Name & Codename */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Fleet Display Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Finance Analytics Swarm"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Fleet Codename / Tag *
              </label>
              <input
                type="text"
                value={codename}
                onChange={e => setCodename(e.target.value.toUpperCase())}
                placeholder="e.g. FLEET-FIN-ANALYTICS"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-cyan-300 font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
                required
              />
            </div>
          </div>

          {/* Purpose & Target Node */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Fleet Domain / Purpose
              </label>
              <select
                value={purpose}
                onChange={e => setPurpose(e.target.value as Fleet['purpose'])}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
              >
                <option value="Core Production">Core Production</option>
                <option value="Autonomous Dev & Code">Autonomous Dev & Code</option>
                <option value="Research & Synthesis">Research & Synthesis</option>
                <option value="Security & Infrastructure">Security & Infrastructure</option>
                <option value="Custom Swarm">Custom Swarm</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Compute Node Cluster
              </label>
              <select
                value={nodeCluster}
                onChange={e => setNodeCluster(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
              >
                <option value="node-01.us-east.h100 (80GB SXM5)">node-01.us-east.h100 (80GB SXM5)</option>
                <option value="node-02.us-east.h100 (80GB SXM5)">node-02.us-east.h100 (80GB SXM5)</option>
                <option value="node-03.eu-west.l40s (48GB PCIe)">node-03.eu-west.l40s (48GB PCIe)</option>
                <option value="node-04.us-central.airgap (RTX 6000 Ada)">node-04.us-central.airgap (RTX 6000 Ada)</option>
                <option value="localhost:8000 (Local Hardware)">localhost:8000 (Local Hardware)</option>
              </select>
            </div>
          </div>

          {/* Default Model & VRAM Footprint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Default LLM Model Weights
              </label>
              <select
                value={defaultModelId}
                onChange={e => setDefaultModelId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
              >
                {AVAILABLE_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tag})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Allocated VRAM Quota
              </label>
              <input
                type="text"
                value={vramAllocated}
                onChange={e => setVramAllocated(e.target.value)}
                placeholder="e.g. 32.0 / 80 GB"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
              Fleet Mission & Directives Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Define operational boundaries, intended task assignments, and routing rules for this fleet partition..."
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_20px_rgba(76,215,246,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Initialize Fleet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
