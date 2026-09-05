import React from 'react';
import { usePet } from '../context/PetContext';
import { PetSpecies } from '../types';
import { 
  X, 
  Sparkles, 
  Heart, 
  Zap, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Bot, 
  Check, 
  Eye, 
  Smile, 
  BellRing
} from 'lucide-react';

interface CyberPetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIES_OPTIONS: { id: PetSpecies; name: string; emoji: string; desc: string }[] = [
  { id: 'falcon', name: 'Hermes Falcon', emoji: '🦅', desc: 'Autonomous telemetry scout bird with optic scanners' },
  { id: 'cat', name: 'Quantum Neko', emoji: '🐱', desc: 'Curious cybernetic feline with quantum purr feedback' },
  { id: 'wyrm', name: 'Synth Wyrm', emoji: '🐉', desc: 'Micro-dragon with plasma breath embers and low-latency flight' },
  { id: 'drone', name: 'Sentry Drone', emoji: '🤖', desc: 'Hovering orbital lidar probe scanning hardware clusters' },
  { id: 'k9', name: 'K9-Cerberus', emoji: '🐕', desc: 'Zero-trust watchdog guarding ingress firewall perimeters' }
];

const ACCESSORY_OPTIONS = [
  { id: 'none', name: 'Clean / Stock', icon: '—' },
  { id: 'visor', name: 'Holo Visor', icon: '🥽' },
  { id: 'halo', name: 'Cyber Halo', icon: '✨' },
  { id: 'jetpack', name: 'Twin Jetpack', icon: '🚀' },
  { id: 'crown', name: 'Pixel Crown', icon: '👑' },
  { id: 'headphones', name: 'DJ Headset', icon: '🎧' }
];

const AURA_COLORS = [
  { name: 'Neon Cyan', color: '#4cd7f6' },
  { name: 'Phosphor Green', color: '#00ff66' },
  { name: 'Solar Amber', color: '#f59e0b' },
  { name: 'Synth Magenta', color: '#f43f5e' },
  { name: 'Hyper Violet', color: '#a855f7' },
  { name: 'Titanium Ice', color: '#38bdf8' }
];

export const CyberPetModal: React.FC<CyberPetModalProps> = ({ isOpen, onClose }) => {
  const { pet, updatePet, feedPet, petThePet, playPetChime } = usePet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c101a] border border-white/10 shadow-2xl p-6 sm:p-8 font-mono text-xs text-white max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent Top */}
        <div 
          className="absolute top-0 left-1/4 right-1/4 h-[2px] blur-sm transition-colors duration-500" 
          style={{ backgroundColor: pet.auraColor }} 
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl border flex items-center justify-center text-xl shadow-lg transition-colors"
              style={{ 
                backgroundColor: `${pet.auraColor}15`, 
                borderColor: `${pet.auraColor}40`,
                color: pet.auraColor 
              }}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                Cybernetic Companion Configuration
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  {pet.enabled ? 'ACTIVE' : 'STANDBY'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Personalize your desktop pet companion, species, aura, and interaction chimes.
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Main Toggle & Name Row */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pet.enabled}
                  onChange={(e) => updatePet({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
              <div>
                <span className="font-bold text-white text-xs block">Enable Pet HUD Companion</span>
                <span className="text-[11px] text-slate-400">Renders animated interactive companion on desktop HUD</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Pet Name:</span>
              <input
                type="text"
                value={pet.name}
                onChange={(e) => updatePet({ name: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-cyan-400/50 w-32"
                placeholder="Pet Name"
              />
            </div>
          </div>

          {/* Species Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Companion Species Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {SPECIES_OPTIONS.map(sp => {
                const isSelected = pet.species === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => updatePet({ species: sp.id })}
                    type="button"
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(76,215,246,0.15)] ring-1 ring-cyan-400/30'
                        : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{sp.emoji}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{sp.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">{sp.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aura Glow Color */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Holographic Aura & Resonance
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {AURA_COLORS.map(aura => (
                <button
                  key={aura.color}
                  onClick={() => updatePet({ auraColor: aura.color })}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                    pet.auraColor === aura.color
                      ? 'border-white bg-white/10 ring-1 ring-white/30'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06]'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: aura.color }} 
                  />
                  <span className="text-[11px] text-slate-200 font-medium">{aura.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              3. Cybernetic Accessories
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ACCESSORY_OPTIONS.map(acc => {
                const isSelected = pet.accessory === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => updatePet({ accessory: acc.id as any })}
                    type="button"
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/15 shadow-sm'
                        : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="text-lg mb-1">{acc.icon}</div>
                    <div className="text-[10px] font-medium text-slate-200 truncate">{acc.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position & Sound feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <span className="text-xs font-bold text-white block">HUD Dock Position</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updatePet({ position: 'docked-right' })}
                  className={`flex-1 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                    pet.position === 'docked-right'
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Bottom Right
                </button>
                <button
                  type="button"
                  onClick={() => updatePet({ position: 'docked-left' })}
                  className={`flex-1 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                    pet.position === 'docked-left'
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  Bottom Left
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Synthesized Audio Chimes</span>
                <button
                  type="button"
                  onClick={() => playPetChime('happy')}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <BellRing className="w-3 h-3" /> Test Chime
                </button>
              </div>
              <button
                type="button"
                onClick={() => updatePet({ chimesEnabled: !pet.chimesEnabled })}
                className={`w-full py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-2 transition-all ${
                  pet.chimesEnabled
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/10 text-slate-400'
                }`}
              >
                {pet.chimesEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{pet.chimesEnabled ? 'Chimes Active' : 'Chimes Muted'}</span>
              </button>
            </div>
          </div>

          {/* Quick Pet Interaction Test */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs">Vitals & Happiness Level</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Happiness: <span className="text-emerald-400 font-bold">{pet.happiness}%</span> • Last interaction: {pet.lastInteraction}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={feedPet}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                type="button"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Feed Treat</span>
              </button>
              <button
                onClick={petThePet}
                className="px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                type="button"
              >
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
                <span>Pet Companion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <span className="text-slate-400 text-[11px]">
            Pet settings persist automatically across browser sessions.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-all text-xs font-mono shadow-md"
            type="button"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
