import React, { createContext, useContext, useState, useEffect } from 'react';
import { SkinTheme, SkinOption } from '../types';

export const AVAILABLE_SKINS: SkinOption[] = [
  {
    id: 'hermes-cyber',
    name: 'Hermes Cyber',
    tagline: 'Cyber Obsidian, Neon Cyan & Holographic Glass',
    category: 'dark',
    accentColor: '#4cd7f6',
    secondaryColor: '#a855f7',
    bgColor: '#07090e',
    cardColor: '#101622',
    borderColor: 'rgba(76, 215, 246, 0.3)',
    swatches: ['#07090e', '#4cd7f6', '#a855f7']
  },
  {
    id: 'tactical-emerald',
    name: 'Tactical Emerald',
    tagline: 'Mainframe Phosphor Green & Tactical Carbon',
    category: 'dark',
    accentColor: '#00ff66',
    secondaryColor: '#10b981',
    bgColor: '#040805',
    cardColor: '#09120c',
    borderColor: 'rgba(0, 255, 102, 0.3)',
    swatches: ['#040805', '#00ff66', '#10b981']
  },
  {
    id: 'solar-amber',
    name: 'Solar Amber',
    tagline: 'Neuromancer Industrial Obsidian & Warm Gold',
    category: 'dark',
    accentColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    bgColor: '#0c0a09',
    cardColor: '#171310',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    swatches: ['#0c0a09', '#f59e0b', '#f97316']
  },
  {
    id: 'sunset-synth',
    name: 'Sunset Synthwave',
    tagline: 'Tokyo Midnight Indigo, Hot Magenta & Electric Violet',
    category: 'dark',
    accentColor: '#f43f5e',
    secondaryColor: '#c084fc',
    bgColor: '#0b0717',
    cardColor: '#150f28',
    borderColor: 'rgba(244, 63, 94, 0.35)',
    swatches: ['#0b0717', '#f43f5e', '#a855f7']
  },
  {
    id: 'oled-monolith',
    name: 'OLED Monolith',
    tagline: 'Pitch Black OLED Zero, Cool Platinum & Ice Blue',
    category: 'dark',
    accentColor: '#38bdf8',
    secondaryColor: '#cbd5e1',
    bgColor: '#000000',
    cardColor: '#0a0a0a',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    swatches: ['#000000', '#38bdf8', '#94a3b8']
  },
  {
    id: 'alpine-daylight',
    name: 'Alpine Daylight',
    tagline: 'Architectural Pure White, Tech Cobalt & Deep Slate',
    category: 'light',
    accentColor: '#2563eb',
    secondaryColor: '#0284c7',
    bgColor: '#f1f5f9',
    cardColor: '#ffffff',
    borderColor: 'rgba(37, 99, 235, 0.25)',
    swatches: ['#f8fafc', '#2563eb', '#0f172a']
  }
];

interface ThemeContextType {
  activeSkin: SkinTheme;
  setActiveSkin: (skin: SkinTheme) => void;
  currentSkinMeta: SkinOption;
  availableSkins: SkinOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSkin, setActiveSkinState] = useState<SkinTheme>(() => {
    const saved = localStorage.getItem('hermes_active_skin') as SkinTheme;
    if (saved && AVAILABLE_SKINS.some(s => s.id === saved)) {
      return saved;
    }
    return 'hermes-cyber';
  });

  const setActiveSkin = (skin: SkinTheme) => {
    setActiveSkinState(skin);
    localStorage.setItem('hermes_active_skin', skin);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeSkin);
    
    if (activeSkin === 'alpine-daylight') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [activeSkin]);

  const currentSkinMeta = AVAILABLE_SKINS.find(s => s.id === activeSkin) || AVAILABLE_SKINS[0];

  return (
    <ThemeContext.Provider value={{ activeSkin, setActiveSkin, currentSkinMeta, availableSkins: AVAILABLE_SKINS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
