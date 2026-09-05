import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SkinTheme } from '../types';
import { 
  Check, 
  Palette, 
  Sparkles, 
  X, 
  Sun, 
  Moon, 
  Sliders, 
  RotateCcw, 
  Layers, 
  Zap,
  Eye
} from 'lucide-react';

interface SkinSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkinSelectorModal: React.FC<SkinSelectorModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeSkin, 
    setActiveSkin, 
    availableSkins,
    customTheme,
    updateCustomTheme,
    resetCustomTheme,
    isCustomThemeActive,
    setIsCustomThemeActive
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'presets' | 'designer'>('presets');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c101a] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden text-white font-mono text-xs animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Glow Accent Top */}
        <div 
          className="absolute top-0 left-1/4 right-1/4 h-[2px] blur-sm transition-colors duration-500" 
          style={{ backgroundColor: isCustomThemeActive ? customTheme.accentColor : '#4cd7f6' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg transition-colors"
              style={{ 
                backgroundColor: isCustomThemeActive ? `${customTheme.accentColor}15` : 'rgba(76,215,246,0.1)',
                borderColor: isCustomThemeActive ? `${customTheme.accentColor}40` : 'rgba(76,215,246,0.3)',
                color: isCustomThemeActive ? customTheme.accentColor : '#4cd7f6'
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                Theme Studio & Atmosphere Engine
                {isCustomThemeActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                    CUSTOM ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select pre-calibrated command atmospheres or custom tune accent colors, glow, and glass.
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
        <div className="flex items-center gap-2 mb-5 shrink-0 border-b border-white/[0.06] pb-3">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Skins ({availableSkins.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('designer')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'designer'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Theme Designer (Custom)</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'presets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {availableSkins.map((skin) => {
                const isSelected = !isCustomThemeActive && activeSkin === skin.id;

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
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {skin.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {skin.category === 'light' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                              <Sun className="w-2.5 h-2.5" /> Light
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-400/10 text-indigo-300 border border-indigo-400/20 flex items-center gap-1">
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

                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                        {isSelected ? 'ACTIVE' : 'APPLY'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'designer' && (
            <div className="space-y-5">
              {/* Activate Switch */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Activate Custom Theme Engine
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Overrides predefined skins with your custom configured chromatic palette and CSS variables.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomThemeActive}
                    onChange={(e) => setIsCustomThemeActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                </label>
              </div>

              {/* Color Customizers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Accent Color */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Primary Accent Color</span>
                    <span className="text-[11px] font-mono text-cyan-300">{customTheme.accentColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.accentColor}
                      onChange={(e) => updateCustomTheme({ accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.accentColor}
                      onChange={(e) => updateCustomTheme({ accentColor: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Secondary / Glow Color</span>
                    <span className="text-[11px] font-mono text-purple-300">{customTheme.secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.secondaryColor}
                      onChange={(e) => updateCustomTheme({ secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.secondaryColor}
                      onChange={(e) => updateCustomTheme({ secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Background Base Color */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Base Background Tint</span>
                    <span className="text-[11px] font-mono text-slate-300">{customTheme.bgColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.bgColor}
                      onChange={(e) => updateCustomTheme({ bgColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.bgColor}
                      onChange={(e) => updateCustomTheme({ bgColor: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Surface Card Tint */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Container / Card Tint</span>
                    <span className="text-[11px] font-mono text-slate-300">{customTheme.cardColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customTheme.cardColor}
                      onChange={(e) => updateCustomTheme({ cardColor: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customTheme.cardColor}
                      onChange={(e) => updateCustomTheme({ cardColor: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Optical FX: Glow Intensity & Glassmorphism & Font Scaling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Glow */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <span className="text-xs font-bold text-white block">Glow Radiance</span>
                  <select
                    value={customTheme.glowIntensity}
                    onChange={(e) => updateCustomTheme({ glowIntensity: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="subtle">Subtle</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra Neon</option>
                  </select>
                </div>

                {/* Glassmorphism */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <span className="text-xs font-bold text-white block">Glass Backdrops</span>
                  <button
                    type="button"
                    onClick={() => updateCustomTheme({ glassmorphism: !customTheme.glassmorphism })}
                    className={`w-full py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      customTheme.glassmorphism
                        ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    {customTheme.glassmorphism ? 'Enabled (Blur)' : 'Opaque'}
                  </button>
                </div>

                {/* Font Scaling */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                  <span className="text-xs font-bold text-white block">Display Scaling</span>
                  <select
                    value={customTheme.fontScaling}
                    onChange={(e) => updateCustomTheme({ fontScaling: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="compact">Compact Dense</option>
                    <option value="standard">Standard</option>
                    <option value="expanded">Comfortable</option>
                  </select>
                </div>
              </div>

              {/* Reset to Factory Custom Theme */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={resetCustomTheme}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Custom Theme to Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Dynamic DOM CSS variables update in real-time.</span>
          </div>

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
