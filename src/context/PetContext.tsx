import React, { createContext, useContext, useState, useEffect } from 'react';
import { PetConfig, PetSpecies, PetMood } from '../types';

interface PetContextType {
  pet: PetConfig;
  updatePet: (updates: Partial<PetConfig>) => void;
  feedPet: () => void;
  petThePet: () => void;
  triggerPetSpeech: (message: string) => void;
  speechMessage: string | null;
  playPetChime: (type?: 'happy' | 'alert' | 'chirp') => void;
}

const DEFAULT_PET: PetConfig = {
  enabled: true,
  species: 'falcon',
  name: 'Argos',
  mood: 'happy',
  accessory: 'visor',
  auraColor: '#4cd7f6',
  chimesEnabled: true,
  position: 'docked-right',
  happiness: 94,
  hunger: 18,
  lastInteraction: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const PET_STORAGE_KEY = 'hermes_pet_config_v1';

const PetContext = createContext<PetContextType | undefined>(undefined);

// Web Audio API pure tone synthesizer for pet chimes (zero external audio file dependency)
const synthesizeChime = (type: 'happy' | 'alert' | 'chirp' = 'chirp') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'happy') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'alert') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15); // A4
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (e) {
    // Audio context may be blocked by browser autoplay policy before user gesture
  }
};

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pet, setPetState] = useState<PetConfig>(() => {
    try {
      const saved = localStorage.getItem(PET_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load pet from localStorage', e);
    }
    return DEFAULT_PET;
  });

  const [speechMessage, setSpeechMessage] = useState<string | null>("Neural falcon Argos online! All 5 agent partitions nominal.");

  useEffect(() => {
    try {
      localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet));
    } catch (e) {
      console.error('Failed to save pet config', e);
    }
  }, [pet]);

  // Periodic random idle dialogues
  useEffect(() => {
    if (!pet.enabled) return;

    const idleQuotes = [
      "Telemetry looking crisp, Operator!",
      "Argos scanned 14 node transceivers. 0 packet drops!",
      "VRAM headroom at optimal 68GB. Steady hum...",
      "Monitoring speculative decoding threads. Purr...",
      "Inference queue latency is under 18ms!",
      "Need any subtasks delegated? Ready to assist!"
    ];

    const interval = setInterval(() => {
      // 30% chance to show a brief dialogue every 45s
      if (Math.random() < 0.35) {
        const quote = idleQuotes[Math.floor(Math.random() * idleQuotes.length)];
        setSpeechMessage(quote);
        setTimeout(() => setSpeechMessage(null), 6000);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [pet.enabled]);

  const updatePet = (updates: Partial<PetConfig>) => {
    setPetState(prev => ({
      ...prev,
      ...updates,
      lastInteraction: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  };

  const playPetChime = (type: 'happy' | 'alert' | 'chirp' = 'chirp') => {
    if (pet.chimesEnabled) {
      synthesizeChime(type);
    }
  };

  const feedPet = () => {
    playPetChime('happy');
    setPetState(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      hunger: Math.max(0, prev.hunger - 25),
      mood: 'happy',
      lastInteraction: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    setSpeechMessage("*Gulp!* Energetic battery cell absorbed! Energy 100%!");
    setTimeout(() => setSpeechMessage(null), 5000);
  };

  const petThePet = () => {
    playPetChime('chirp');
    setPetState(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      mood: 'happy',
      lastInteraction: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
    const reacts = [
      "*Happy chirp!* Neural bond strengthened!",
      "Aura resonance calibrated. Thank you, Operator!",
      "*Purrs smoothly* Standing by for command input!"
    ];
    setSpeechMessage(reacts[Math.floor(Math.random() * reacts.length)]);
    setTimeout(() => setSpeechMessage(null), 5000);
  };

  const triggerPetSpeech = (message: string) => {
    setSpeechMessage(message);
    playPetChime('alert');
    setTimeout(() => setSpeechMessage(null), 6000);
  };

  return (
    <PetContext.Provider
      value={{
        pet,
        updatePet,
        feedPet,
        petThePet,
        triggerPetSpeech,
        speechMessage,
        playPetChime
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};
