import React, { useState, useRef } from 'react';
import { Agent } from '../types';
import { useCluster } from '../context/ClusterContext';
import { AGENT_AVATAR_PRESETS } from '../data/mockData';
import { 
  X, 
  Camera, 
  Upload, 
  Link, 
  Check, 
  Trash2, 
  Sparkles,
  Bot
} from 'lucide-react';

interface AgentPhotoModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentPhotoModal: React.FC<AgentPhotoModalProps> = ({ agent, isOpen, onClose }) => {
  const { updateAgentPhoto } = useCluster();
  const [selectedPhoto, setSelectedPhoto] = useState<string>(agent?.avatarPhoto || '');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when agent changes
  React.useEffect(() => {
    if (agent) {
      setSelectedPhoto(agent.avatarPhoto || '');
    }
  }, [agent]);

  if (!isOpen || !agent) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target!.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateAgentPhoto(agent.id, selectedPhoto);
    onClose();
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setSelectedPhoto(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c101a] border border-white/10 shadow-2xl p-6 sm:p-7 font-mono text-xs text-white flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Update Agent Portrait Photo
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target: <span className="text-cyan-300 font-bold">{agent.name}</span> ({agent.codename})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all border border-white/[0.06]"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5">
          {/* Current Photo Display */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-400/40 bg-slate-900 shrink-0 shadow-lg">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-cyan-950/40 text-cyan-400">
                  <Bot className="w-8 h-8 opacity-60" />
                  <span className="text-[8px] text-slate-400 mt-1">Default Icon</span>
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <div className="font-bold text-white text-xs">{agent.name}</div>
              <div className="text-[11px] text-slate-400">{agent.role}</div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/30 transition-all flex items-center gap-1.5 text-[11px] font-bold"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all flex items-center gap-1.5 text-[11px]"
                >
                  <Link className="w-3 h-3" />
                  <span>URL</span>
                </button>

                {selectedPhoto && (
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto('')}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all"
                    title="Remove Photo (Revert to default vector icon)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {showUrlInput && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10 animate-in fade-in duration-150">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-transparent text-white text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 rounded-lg bg-cyan-400 text-black font-bold text-xs"
              >
                Apply
              </button>
            </div>
          )}

          {/* Curated Agent Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                Choose Cyber Persona Preset
              </label>
              <span className="text-[10px] text-slate-500">8 High-res options</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {AGENT_AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedPhoto === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPhoto(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 shadow-md'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-500/25 flex items-center justify-center">
                        <Check className="w-4 h-4 text-cyan-200 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/10 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-all text-xs font-mono shadow-md flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SAVE PORTRAIT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
