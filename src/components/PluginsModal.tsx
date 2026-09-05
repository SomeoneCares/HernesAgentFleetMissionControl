import React, { useState } from 'react';
import { usePlugins } from '../context/PluginsContext';
import { CustomPlugin } from '../types';
import { 
  X, 
  Puzzle, 
  Terminal, 
  Volume2, 
  Activity, 
  Code2, 
  Radio, 
  Sparkles, 
  Check, 
  Plus, 
  Sliders, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface PluginsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginsModal: React.FC<PluginsModalProps> = ({ isOpen, onClose }) => {
  const { 
    plugins, 
    togglePlugin, 
    updatePluginSettings, 
    addCustomPlugin, 
    customCss, 
    setCustomCss 
  } = usePlugins();

  const [activeTab, setActiveTab] = useState<'all' | 'custom-css' | 'new'>('all');
  const [newPluginName, setNewPluginName] = useState('');
  const [newPluginDesc, setNewPluginDesc] = useState('');
  const [newPluginCat, setNewPluginCat] = useState<'visual' | 'audio' | 'telemetry' | 'utility'>('visual');

  if (!isOpen) return null;

  const handleCreatePlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName.trim()) return;

    const newId = `user-plugin-${Date.now()}`;
    const plugin: CustomPlugin = {
      id: newId,
      name: newPluginName.trim(),
      description: newPluginDesc.trim() || 'User defined custom UI plugin extension.',
      category: newPluginCat,
      enabled: true,
      version: '1.0.0',
      author: 'Operator (Local)',
      icon: 'Sparkles',
      configurable: false
    };

    addCustomPlugin(plugin);
    setNewPluginName('');
    setNewPluginDesc('');
    setActiveTab('all');
  };

  const getPluginIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-4 h-4 text-cyan-400" />;
      case 'Volume2': return <Volume2 className="w-4 h-4 text-emerald-400" />;
      case 'Activity': return <Activity className="w-4 h-4 text-purple-400" />;
      case 'Code2': return <Code2 className="w-4 h-4 text-amber-400" />;
      case 'Radio': return <Radio className="w-4 h-4 text-pink-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c101a] border border-white/10 shadow-2xl p-6 sm:p-8 font-mono text-xs text-white max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent Top */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                Custom UI Plugins & Extensions
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  {plugins.filter(p => p.enabled).length} / {plugins.length} ENABLED
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure ambient visual engines, audio synthesizer, HUD overlays, and custom CSS.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all border border-white/[0.06]"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-4 shrink-0 border-b border-white/[0.06] pb-3 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Installed Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setActiveTab('custom-css')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'custom-css'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom CSS Injector
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plugin</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'all' && (
            <div className="space-y-3">
              {plugins.map(plugin => (
                <div
                  key={plugin.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    plugin.enabled
                      ? 'bg-white/[0.03] border-cyan-400/30 ring-1 ring-cyan-400/15'
                      : 'bg-white/[0.01] border-white/[0.06] opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 shrink-0">
                        {getPluginIcon(plugin.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-white text-xs">{plugin.name}</span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">
                            v{plugin.version}
                          </span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-300">
                            {plugin.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {plugin.description}
                        </p>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Author: <span className="text-slate-400">{plugin.author}</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={plugin.enabled}
                        onChange={() => togglePlugin(plugin.id)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-400"></div>
                    </label>
                  </div>

                  {/* Plugin specific quick settings if enabled */}
                  {plugin.enabled && plugin.configurable && plugin.settings && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
                      {plugin.id === 'matrix-rain' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Opacity:</span>
                            <input
                              type="range"
                              min="0.05"
                              max="0.4"
                              step="0.02"
                              value={plugin.settings.opacity || 0.14}
                              onChange={(e) => updatePluginSettings(plugin.id, { opacity: parseFloat(e.target.value) })}
                              className="w-20 accent-cyan-400"
                            />
                            <span className="text-cyan-300 font-mono text-[10px]">
                              {Math.round((plugin.settings.opacity || 0.14) * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Rain Tint:</span>
                            <input
                              type="color"
                              value={plugin.settings.color || '#4cd7f6'}
                              onChange={(e) => updatePluginSettings(plugin.id, { color: e.target.value })}
                              className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                            />
                          </div>
                        </>
                      )}

                      {plugin.id === 'sound-synth' && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Master Volume:</span>
                          <input
                            type="range"
                            min="0.05"
                            max="0.8"
                            step="0.05"
                            value={plugin.settings.volume || 0.25}
                            onChange={(e) => updatePluginSettings(plugin.id, { volume: parseFloat(e.target.value) })}
                            className="w-24 accent-emerald-400"
                          />
                          <span className="text-emerald-300 font-mono text-[10px]">
                            {Math.round((plugin.settings.volume || 0.25) * 100)}%
                          </span>
                        </div>
                      )}

                      {plugin.id === 'token-ticker' && (
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={plugin.settings.showUsdCost !== false}
                              onChange={(e) => updatePluginSettings(plugin.id, { showUsdCost: e.target.checked })}
                              className="rounded accent-purple-400"
                            />
                            <span>Include Burn Rate ($USD)</span>
                          </label>
                        </div>
                      )}

                      {plugin.id === 'quake-terminal' && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Summon Key:</span>
                          <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-cyan-300 font-bold">
                            ~ (Backtick)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom-css' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    Custom CSS Live Sandbox
                  </div>
                  <button
                    onClick={() => setCustomCss('/* Custom CSS Rules */\n')}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    type="button"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Inject rules to customize cards, animations, border radii, or typography. Injected directly into the DOM runtime.
                </p>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  rows={10}
                  className="w-full p-3 rounded-xl bg-[#07090e] border border-white/10 text-emerald-300 font-mono text-xs focus:outline-none focus:border-cyan-400/50 leading-relaxed"
                  placeholder="/* Enter custom CSS rules */&#10;.custom-glow { filter: drop-shadow(0 0 10px #4cd7f6); }"
                />
              </div>
            </div>
          )}

          {activeTab === 'new' && (
            <form onSubmit={handleCreatePlugin} className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
              <div>
                <h3 className="font-bold text-white text-xs mb-1">Register Custom Plugin Definition</h3>
                <p className="text-[11px] text-slate-400">
                  Register a modular UI extension hook to be saved with your Hermes mission control preferences.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Plugin Name:</label>
                  <input
                    type="text"
                    required
                    value={newPluginName}
                    onChange={(e) => setNewPluginName(e.target.value)}
                    placeholder="e.g. Latency Heatmap Overlay"
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Description:</label>
                  <input
                    type="text"
                    value={newPluginDesc}
                    onChange={(e) => setNewPluginDesc(e.target.value)}
                    placeholder="Brief description of what this plugin hooks into"
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Category:</label>
                  <select
                    value={newPluginCat}
                    onChange={(e) => setNewPluginCat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                  >
                    <option value="visual">Visual Display</option>
                    <option value="audio">Audio & Synthesizer</option>
                    <option value="telemetry">Telemetry & Analytics</option>
                    <option value="utility">Utility & Productivity</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Plugin</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <span className="text-slate-400 text-[11px]">
            Plugin registry is managed via persistent browser storage.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-all text-xs font-mono shadow-md"
            type="button"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
