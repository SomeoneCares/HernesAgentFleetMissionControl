import React, { useState, useRef } from 'react';
import { useCluster } from '../context/ClusterContext';
import { AGENT_AVATAR_PRESETS } from '../data/mockData';
import { 
  X, 
  User, 
  Camera, 
  Upload, 
  Link, 
  ShieldCheck, 
  Check, 
  Mail, 
  Hash, 
  BadgeCheck,
  RotateCcw
} from 'lucide-react';

interface OperatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorProfileModal: React.FC<OperatorProfileModalProps> = ({ isOpen, onClose }) => {
  const { operatorProfile, updateOperatorProfile } = useCluster();
  
  const [formData, setFormData] = useState({
    name: operatorProfile.name,
    callsign: operatorProfile.callsign,
    role: operatorProfile.role,
    authLevel: operatorProfile.authLevel,
    photoUrl: operatorProfile.photoUrl || '',
    bio: operatorProfile.bio || '',
    email: operatorProfile.email || ''
  });

  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, photoUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOperatorProfile(formData);
    onClose();
  };

  const handlePresetSelect = (url: string) => {
    setFormData(prev => ({ ...prev, photoUrl: url }));
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setFormData(prev => ({ ...prev, photoUrl: urlInput.trim() }));
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c101a] border border-white/10 shadow-2xl p-6 sm:p-8 font-mono text-xs text-white max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Operator Security Profile & Portrait
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  {formData.authLevel}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize your biometric portrait, operator callsign, and mission role credentials.
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

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Portrait Photo Section */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center gap-6">
            {/* Photo Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(76,215,246,0.2)] bg-slate-900 relative">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-cyan-950 text-cyan-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
                {/* Upload Overlay on Hover */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-cyan-300 gap-1 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold">CHANGE</span>
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-black p-1 rounded-full border-2 border-[#0c101a] shadow">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            {/* Photo Upload Controls */}
            <div className="flex-1 space-y-2.5 text-center sm:text-left">
              <div className="font-bold text-white text-xs">Biometric Identity Photo</div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Upload a portrait image from your filesystem or select from curated cyber presets.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
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
                  className="px-3 py-1.5 rounded-xl bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all flex items-center gap-1.5 text-xs"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>

              {showUrlInput && (
                <div className="flex items-center gap-2 mt-2 pt-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Curated Identity Portraits
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AGENT_AVATAR_PRESETS.map((preset) => {
                const isSelected = formData.photoUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105'
                        : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
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
                      <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-cyan-300 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Full Name / Alias
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50 font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                Tactical Callsign
              </label>
              <input
                type="text"
                required
                value={formData.callsign}
                onChange={(e) => setFormData(prev => ({ ...prev, callsign: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50 font-bold text-cyan-300"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                Cluster Operational Role
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Comms Channel / Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Security Directive & Operator Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400/50 leading-relaxed"
                placeholder="Mission directive details..."
              />
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/10 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-all text-xs font-mono shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>SAVE PROFILE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
