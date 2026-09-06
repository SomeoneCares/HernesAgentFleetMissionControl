import React, { useState, useRef, useEffect } from 'react';
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
  RotateCcw,
  Sparkles,
  Trash2
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

  // Sync state whenever modal opens or operatorProfile changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: operatorProfile.name,
        callsign: operatorProfile.callsign,
        role: operatorProfile.role,
        authLevel: operatorProfile.authLevel,
        photoUrl: operatorProfile.photoUrl || '',
        bio: operatorProfile.bio || '',
        email: operatorProfile.email || ''
      });
      setShowUrlInput(false);
      setUrlInput('');
    }
  }, [isOpen, operatorProfile]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleResetPhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: '' }));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="operator-profile-modal-card"
        className="relative w-full max-w-xl sm:max-w-2xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#0c101a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] font-mono text-xs text-white overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Glow Ambient Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />

        {/* Pinned Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f18]/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Operator Profile & Portrait
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 whitespace-nowrap">
                  {formData.authLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Configure biometric portrait, operator callsign, and mission directive
              </p>
            </div>
          </div>

          <button
            id="close-operator-modal-btn"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all border border-white/[0.06] shrink-0 ml-2 cursor-pointer"
            type="button"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="operator-profile-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Portrait Photo Section - Fully Contained */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            {/* Photo Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(76,215,246,0.2)] bg-slate-950 relative">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-cyan-950/40 text-cyan-400">
                    <User className="w-8 h-8 opacity-70" />
                    <span className="text-[9px] text-cyan-300 font-bold mt-1">NO PHOTO</span>
                  </div>
                )}
                {/* Upload Overlay on Hover */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-cyan-300 gap-1 cursor-pointer"
                  title="Click to choose a new photo"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold tracking-wider">CHANGE</span>
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-1 rounded-full border-2 border-[#0c101a] shadow">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            {/* Photo Controls */}
            <div className="flex-1 min-w-0 w-full text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-between gap-2 flex-wrap">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Biometric Photo & Avatar
                </span>
                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Upload your portrait file, paste an image link, or choose from cyber presets below.
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
                  className="px-3 py-1.5 rounded-xl bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 border border-cyan-400/30 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                    showUrlInput 
                      ? 'bg-cyan-400 text-black font-bold' 
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
                  }`}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyUrl();
                      }
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 transition-colors shrink-0 cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Avatars with strict scroll/size boundaries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Curated Cybernetic Portraits
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {AGENT_AVATAR_PRESETS.length} presets
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-32 sm:max-h-36 overflow-y-auto p-2 rounded-xl bg-black/40 border border-white/[0.06] custom-scrollbar">
              {AGENT_AVATAR_PRESETS.map((preset) => {
                const isSelected = formData.photoUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 z-10'
                        : 'border-white/10 hover:border-white/40 opacity-75 hover:opacity-100'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-cyan-200 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50 font-bold font-mono"
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
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-cyan-300 text-xs focus:outline-none focus:border-cyan-400/50 font-bold font-mono"
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
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50 font-mono"
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
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400/50 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Security Directive & Operator Bio
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400/50 leading-relaxed font-mono"
                placeholder="Mission directive details..."
              />
            </div>
          </div>
        </form>

        {/* Pinned Sticky Footer - Always in View! */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#090d16] flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10 text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-all text-xs font-mono shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>SAVE PROFILE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
