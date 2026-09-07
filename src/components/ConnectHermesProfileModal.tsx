import React, { useState } from 'react';
import { useCluster } from '../context/ClusterContext';
import { X, Server, Sparkles, RefreshCw, CheckCircle2, Bot, Layers, ArrowRight, Trash2, Cpu } from 'lucide-react';

interface ConnectHermesProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectHermesProfileModal: React.FC<ConnectHermesProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    portalSettings, 
    registerHermesProfileAndFleet, 
    syncHermesProfilesAndFleets, 
    availableModels,
    showToast 
  } = useCluster();

  const [activeMode, setActiveMode] = useState<'auto_sync' | 'manual_register'>('auto_sync');
  const [profileName, setProfileName] = useState('');
  const [fleetCodename, setFleetCodename] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState(portalSettings.connection.connectedAgentModel || 'hermes-agent');
  const [purgeMockups, setPurgeMockups] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setProfileName(val);
    if (!fleetCodename || fleetCodename.startsWith('FLEET-')) {
      const slug = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 16);
      if (slug) {
        setFleetCodename(`FLEET-${slug}`);
      }
    }
  };

  const handleAutoSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncHermesProfilesAndFleets();
      setSyncResult({
        success: result.success,
        message: result.message
      });
      if (result.success) {
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Failed to communicate with Hermes daemon'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    registerHermesProfileAndFleet({
      name: profileName.trim(),
      codename: fleetCodename.trim() || `FLEET-${profileName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
      description: description.trim() || `Live Hermes profile: ${profileName.trim()}`,
      modelId: selectedModel,
      purgeMockups
    });

    setProfileName('');
    setFleetCodename('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c101a] border border-cyan-400/30 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] font-mono text-xs text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Connect Live Hermes Profile & Fleet
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-semibold uppercase tracking-wider">
                  REAL DAEMON
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Link the profile and fleet configured on your Hermes Agent to this Mission Control dashboard
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

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
          <button
            type="button"
            onClick={() => { setActiveMode('auto_sync'); setSyncResult(null); }}
            className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'auto_sync'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_12px_rgba(76,215,246,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auto-Discover from Daemon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('manual_register')}
            className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'manual_register'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_12px_rgba(76,215,246,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Enter Profile & Fleet Name</span>
          </button>
        </div>

        {/* 1. AUTO-DISCOVER MODE */}
        {activeMode === 'auto_sync' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-400/20 text-slate-300 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  Target Gateway Server:
                </span>
                <span className="font-mono text-cyan-300 px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  {portalSettings.connection.serverUrl || 'http://localhost:8642'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Queries your local Hermes daemon endpoints (<code className="text-cyan-300">/v1/profiles</code>, <code className="text-cyan-300">/v1/fleets</code>, and <code className="text-cyan-300">/v1/models</code>) to discover any custom agent profiles or swarms created on your host.
              </p>
            </div>

            {syncResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                syncResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                {syncResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                )}
                <span className="leading-snug">{syncResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAutoSync}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-95 text-[#07090e] font-bold shadow-[0_0_15px_rgba(76,215,246,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Scanning Hermes Daemon...' : 'Scan & Sync Profiles'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. MANUAL REGISTER MODE */}
        {activeMode === 'manual_register' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                  Hermes Profile Name *
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. My-Hermes-Swarm"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Name of the agent profile or fleet created on Hermes</p>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                  Fleet Codename Tag *
                </label>
                <input
                  type="text"
                  value={fleetCodename}
                  onChange={e => setFleetCodename(e.target.value.toUpperCase())}
                  placeholder="e.g. FLEET-MY-HERMES"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-cyan-300 font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-400/50"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Identifier shown in Fleet Selector</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Active Model on Hermes Daemon
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id} className="bg-[#0c101a] text-white">
                      {m.tag === 'LIVE GATEWAY' ? '● ' : ''}{m.name} ({m.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                Profile Description / Directives (Optional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Autonomous agent workload details..."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 resize-none"
              />
            </div>

            {/* Checkbox to purge simulated mockup data */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 cursor-pointer">
              <input
                type="checkbox"
                checked={purgeMockups}
                onChange={e => setPurgeMockups(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 bg-black/60 border-white/20"
              />
              <div>
                <span className="font-bold text-white block text-xs">
                  Purge simulated mockup data
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Remove simulated placeholder agents and fleets so only your real Hermes agent and fleet appear.
                </span>
              </div>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-95 text-[#07090e] font-bold shadow-[0_0_15px_rgba(76,215,246,0.3)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Register & Connect Profile</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
