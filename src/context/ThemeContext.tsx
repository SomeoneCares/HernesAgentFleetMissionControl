import React, { createContext, useContext, useState, useEffect } from 'react';
import { SkinTheme, SkinOption, CustomThemeConfig } from '../types';

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

export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
  accentColor: '#4cd7f6',
  secondaryColor: '#a855f7',
  bgColor: '#07090e',
  cardColor: '#101622',
  borderColor: 'rgba(76, 215, 246, 0.3)',
  glowIntensity: 'high',
  glassmorphism: true,
  fontScaling: 'standard'
};

const CUSTOM_THEME_STORAGE_KEY = 'hermes_custom_theme_config_v1';

interface ThemeContextType {
  activeSkin: SkinTheme;
  setActiveSkin: (skin: SkinTheme) => void;
  currentSkinMeta: SkinOption;
  availableSkins: SkinOption[];
  customTheme: CustomThemeConfig;
  updateCustomTheme: (updates: Partial<CustomThemeConfig>) => void;
  resetCustomTheme: () => void;
  isCustomThemeActive: boolean;
  setIsCustomThemeActive: (active: boolean) => void;
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

  const [isCustomThemeActive, setIsCustomThemeActiveState] = useState<boolean>(() => {
    return localStorage.getItem('hermes_custom_theme_active') === 'true';
  });

  const [customTheme, setCustomThemeState] = useState<CustomThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load custom theme', e);
    }
    return DEFAULT_CUSTOM_THEME;
  });

  const setActiveSkin = (skin: SkinTheme) => {
    setActiveSkinState(skin);
    setIsCustomThemeActiveState(false);
    localStorage.setItem('hermes_active_skin', skin);
    localStorage.setItem('hermes_custom_theme_active', 'false');
  };

  const setIsCustomThemeActive = (active: boolean) => {
    setIsCustomThemeActiveState(active);
    localStorage.setItem('hermes_custom_theme_active', active ? 'true' : 'false');
  };

  const updateCustomTheme = (updates: Partial<CustomThemeConfig>) => {
    setCustomThemeState(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setIsCustomThemeActive(true);
  };

  const resetCustomTheme = () => {
    setCustomThemeState(DEFAULT_CUSTOM_THEME);
    localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_THEME));
  };

  // Sync CSS variables & theme classes to root
  useEffect(() => {
    const root = document.documentElement;

    if (isCustomThemeActive) {
      root.setAttribute('data-theme', 'custom');
      root.style.setProperty('--color-theme-accent', customTheme.accentColor);
      root.style.setProperty('--color-theme-secondary', customTheme.secondaryColor);
      root.style.setProperty('--color-theme-bg', customTheme.bgColor);
      root.style.setProperty('--color-theme-card', customTheme.cardColor);
      root.style.setProperty('--color-theme-border', customTheme.borderColor);

      // Glow Intensity
      if (customTheme.glowIntensity === 'none') {
        root.style.setProperty('--glow-blur', '0px');
        root.style.setProperty('--glow-opacity', '0');
      } else if (customTheme.glowIntensity === 'subtle') {
        root.style.setProperty('--glow-blur', '10px');
        root.style.setProperty('--glow-opacity', '0.15');
      } else if (customTheme.glowIntensity === 'high') {
        root.style.setProperty('--glow-blur', '22px');
        root.style.setProperty('--glow-opacity', '0.35');
      } else {
        // overclocked
        root.style.setProperty('--glow-blur', '38px');
        root.style.setProperty('--glow-opacity', '0.6');
      }

      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.setAttribute('data-theme', activeSkin);
      const current = AVAILABLE_SKINS.find(s => s.id === activeSkin) || AVAILABLE_SKINS[0];
      root.style.setProperty('--color-theme-accent', current.accentColor);
      root.style.setProperty('--color-theme-secondary', current.secondaryColor);
      root.style.setProperty('--color-theme-bg', current.bgColor);
      root.style.setProperty('--color-theme-card', current.cardColor);
      root.style.setProperty('--color-theme-border', current.borderColor);

      if (activeSkin === 'alpine-daylight') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    }
  }, [activeSkin, isCustomThemeActive, customTheme]);

  const currentSkinMeta = AVAILABLE_SKINS.find(s => s.id === activeSkin) || AVAILABLE_SKINS[0];

  return (
    <ThemeContext.Provider 
      value={{ 
        activeSkin, 
        setActiveSkin, 
        currentSkinMeta, 
        availableSkins: AVAILABLE_SKINS,
        customTheme,
        updateCustomTheme,
        resetCustomTheme,
        isCustomThemeActive,
        setIsCustomThemeActive
      }}
    >
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
