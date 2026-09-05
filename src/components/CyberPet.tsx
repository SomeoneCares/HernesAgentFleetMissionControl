import React, { useState } from 'react';
import { usePet } from '../context/PetContext';
import { Sparkles, Heart, Zap, Settings, Volume2, VolumeX, MessageSquare } from 'lucide-react';

interface CyberPetProps {
  onOpenConfig: () => void;
}

export const CyberPet: React.FC<CyberPetProps> = ({ onOpenConfig }) => {
  const { pet, feedPet, petThePet, speechMessage } = usePet();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!pet.enabled) return null;

  const handlePetClick = () => {
    setIsAnimating(true);
    petThePet();
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handleFeedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    feedPet();
    setTimeout(() => setIsAnimating(false), 800);
  };

  // Render pet icon/character visual based on species
  const renderSpeciesVisual = () => {
    switch (pet.species) {
      case 'falcon':
        return (
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Holographic aura */}
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
              style={{ backgroundColor: pet.auraColor }}
            />
            {/* Falcon Body */}
            <div className={`relative z-10 text-3xl select-none transition-transform duration-300 ${isAnimating ? 'scale-125 -translate-y-2' : 'hover:scale-110'}`}>
              🦅
            </div>
            {/* Accessories */}
            {pet.accessory === 'visor' && (
              <div className="absolute top-3.5 left-4.5 z-20 w-5 h-1.5 bg-cyan-400/90 rounded-sm shadow-[0_0_8px_#4cd7f6] ring-1 ring-cyan-200" />
            )}
            {pet.accessory === 'halo' && (
              <div className="absolute -top-1 left-3.5 z-20 w-7 h-2 rounded-full border border-amber-300 shadow-[0_0_8px_#f59e0b] animate-bounce" />
            )}
            {pet.accessory === 'jetpack' && (
              <div className="absolute bottom-1 right-2 z-20 w-2 h-3 bg-purple-500 rounded-sm shadow-[0_0_8px_#a855f7]" />
            )}
            {pet.accessory === 'crown' && (
              <div className="absolute -top-2 left-4 z-20 text-xs select-none">👑</div>
            )}
            {pet.accessory === 'headphones' && (
              <div className="absolute top-2 left-3 z-20 text-xs select-none">🎧</div>
            )}
          </div>
        );
      case 'cat':
        return (
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
              style={{ backgroundColor: pet.auraColor }}
            />
            <div className={`relative z-10 text-3xl select-none transition-transform duration-300 ${isAnimating ? 'scale-125 -translate-y-2' : 'hover:scale-110'}`}>
              🐱
            </div>
            {pet.accessory === 'visor' && (
              <div className="absolute top-4 left-4.5 z-20 w-5 h-1.5 bg-cyan-400/90 rounded-sm shadow-[0_0_8px_#4cd7f6]" />
            )}
            {pet.accessory === 'halo' && (
              <div className="absolute -top-1 left-3.5 z-20 w-7 h-2 rounded-full border border-amber-300 shadow-[0_0_8px_#f59e0b]" />
            )}
            {pet.accessory === 'crown' && (
              <div className="absolute -top-2 left-4 z-20 text-xs select-none">👑</div>
            )}
            {pet.accessory === 'headphones' && (
              <div className="absolute top-2 left-3 z-20 text-xs select-none">🎧</div>
            )}
          </div>
        );
      case 'wyrm':
        return (
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
              style={{ backgroundColor: pet.auraColor }}
            />
            <div className={`relative z-10 text-3xl select-none transition-transform duration-300 ${isAnimating ? 'scale-125 -translate-y-2' : 'hover:scale-110'}`}>
              🐉
            </div>
            {pet.accessory === 'visor' && (
              <div className="absolute top-4 left-4 z-20 w-6 h-1.5 bg-cyan-400/90 rounded-sm shadow-[0_0_8px_#4cd7f6]" />
            )}
            {pet.accessory === 'halo' && (
              <div className="absolute -top-1 left-3.5 z-20 w-7 h-2 rounded-full border border-amber-300 shadow-[0_0_8px_#f59e0b]" />
            )}
            {pet.accessory === 'crown' && (
              <div className="absolute -top-2 left-4 z-20 text-xs select-none">👑</div>
            )}
          </div>
        );
      case 'drone':
        return (
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
              style={{ backgroundColor: pet.auraColor }}
            />
            <div className={`relative z-10 text-3xl select-none transition-transform duration-300 ${isAnimating ? 'scale-125 -translate-y-2 rotate-12' : 'hover:scale-110 animate-bounce'}`}>
              🤖
            </div>
            {pet.accessory === 'visor' && (
              <div className="absolute top-4 left-4 z-20 w-6 h-1.5 bg-cyan-400/90 rounded-sm shadow-[0_0_8px_#4cd7f6]" />
            )}
            {pet.accessory === 'halo' && (
              <div className="absolute -top-1 left-3.5 z-20 w-7 h-2 rounded-full border border-amber-300 shadow-[0_0_8px_#f59e0b]" />
            )}
            {pet.accessory === 'crown' && (
              <div className="absolute -top-2 left-4 z-20 text-xs select-none">👑</div>
            )}
          </div>
        );
      case 'k9':
      default:
        return (
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse"
              style={{ backgroundColor: pet.auraColor }}
            />
            <div className={`relative z-10 text-3xl select-none transition-transform duration-300 ${isAnimating ? 'scale-125 -translate-y-2' : 'hover:scale-110'}`}>
              🐕
            </div>
            {pet.accessory === 'visor' && (
              <div className="absolute top-4 left-4.5 z-20 w-5 h-1.5 bg-cyan-400/90 rounded-sm shadow-[0_0_8px_#4cd7f6]" />
            )}
            {pet.accessory === 'halo' && (
              <div className="absolute -top-1 left-3.5 z-20 w-7 h-2 rounded-full border border-amber-300 shadow-[0_0_8px_#f59e0b]" />
            )}
            {pet.accessory === 'crown' && (
              <div className="absolute -top-2 left-4 z-20 text-xs select-none">👑</div>
            )}
          </div>
        );
    }
  };

  const posClass = pet.position === 'docked-left' 
    ? 'left-6 bottom-6' 
    : 'right-6 bottom-6';

  return (
    <div 
      className={`fixed ${posClass} z-40 flex flex-col items-end pointer-events-auto font-mono text-xs`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Speech Bubble dialogue */}
      {speechMessage && (
        <div className="mb-2 max-w-xs p-3 rounded-2xl bg-[#0c101a]/95 border border-cyan-400/40 shadow-2xl backdrop-blur-md text-cyan-200 text-xs animate-in fade-in zoom-in-95 duration-200 flex items-start gap-2 ring-1 ring-cyan-400/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-[9px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
              <span>{pet.name} ({pet.species.toUpperCase()})</span>
              <span className="text-emerald-400 font-normal">• {pet.happiness}% Happy</span>
            </div>
            <p className="leading-snug text-slate-200 text-[11px]">{speechMessage}</p>
          </div>
        </div>
      )}

      {/* Main Pet Container */}
      <div className="flex items-center gap-2">
        {/* Hover quick action buttons */}
        {isHovered && (
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c101a]/90 border border-white/10 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-right-2 duration-150">
            <button
              onClick={handleFeedClick}
              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/20 transition-all flex items-center gap-1"
              title="Feed Energon Cell"
              type="button"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold">Feed</span>
            </button>
            <button
              onClick={handlePetClick}
              className="p-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/25 text-pink-300 border border-pink-500/20 transition-all flex items-center gap-1"
              title="Pet / Cuddle"
              type="button"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/30" />
              <span className="text-[10px] font-bold">Pet</span>
            </button>
            <button
              onClick={onOpenConfig}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/[0.08] transition-all"
              title="Configure Pet Companion"
              type="button"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-400 hover:rotate-45 transition-transform" />
            </button>
          </div>
        )}

        {/* Pet Avatar Interactive Button */}
        <div
          onClick={handlePetClick}
          className="relative group p-2 rounded-2xl bg-[#0c101a]/90 border border-white/[0.12] hover:border-cyan-400/50 shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-105"
          title={`Click to pet ${pet.name}! Double click or settings to configure.`}
        >
          {renderSpeciesVisual()}

          {/* Name & Happiness Bar underneath */}
          <div className="text-center mt-1">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] font-bold text-white tracking-wider truncate max-w-[65px]">
                {pet.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            {/* Happiness meter line */}
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-0.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" 
                style={{ width: `${pet.happiness}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
