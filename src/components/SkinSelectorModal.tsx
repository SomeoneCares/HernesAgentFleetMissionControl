import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SkinTheme } from '../types';
import { Check, Palette, Sparkles, X, Sun, Moon } from 'lucide-react';

interface SkinSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkinSelectorModal: React.FC<SkinSelectorModalProps> = ({ isOpen, onClose }) => {
  const { activeSkin, setActiveSkin, availableSkins } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c101a] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden text-white font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent Top */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                Mission Control Visual Skins
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                  {availableSkins.length} SKINS READY
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your preferred command center atmosphere. Changes persist automatically.
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

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[62vh] overflow-y-auto pr-1">
          {availableSkins.map((skin) => {
            const isSelected = activeSkin === skin.id;

            return (
              <div
                key={skin.id}
                onClick={() => setActiveSkin(skin.id as SkinTheme)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(76,215,246,0.15)] ring-1 ring-cyan-400/40'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.18]'
                }`}
              >
                {/* Top Row: Name & Mode Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {skin.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {skin.category === 'light' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                          <Sun className="w-2.5 h-2.5" /> Light
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-400/10 text-indigo-300 border border-indigo-400/20 flex items-center gap-1">
                          <Moon className="w-2.5 h-2.5" /> Dark
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-4">
                    {skin.tagline}
                  </p>
                </div>

                {/* Bottom Color Swatches Bar */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {skin.swatches.map((swatch, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: swatch }}
                        title={swatch}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                    {isSelected ? 'ACTIVE' : 'APPLY SKIN'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Theme preferences are saved automatically in your browser session.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition-all text-xs font-mono"
            type="button"
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
    </div>
  );
};
