import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomPlugin } from '../types';

interface PluginsContextType {
  plugins: CustomPlugin[];
  togglePlugin: (pluginId: string) => void;
  updatePluginSettings: (pluginId: string, settings: Record<string, any>) => void;
  isPluginEnabled: (pluginId: string) => boolean;
  addCustomPlugin: (plugin: CustomPlugin) => void;
  customCss: string;
  setCustomCss: (css: string) => void;
}

export const DEFAULT_PLUGINS: CustomPlugin[] = [
  {
    id: 'matrix-rain',
    name: 'Matrix Digital Rain Layer',
    description: 'Renders an ambient falling phosphor cyan/green cybernetic rain stream behind dashboard panels.',
    category: 'visual',
    enabled: true,
    version: '1.2.0',
    author: 'Hermes Cyber Lab',
    icon: 'Terminal',
    configurable: true,
    settings: {
      opacity: 0.14,
      speed: 1.0,
      color: '#4cd7f6'
    }
  },
  {
    id: 'sound-synth',
    name: 'Quantum Audio Synthesizer',
    description: 'Generates tactile low-latency cybernetic audio feedback on clicks, task transitions, and telemetry triggers.',
    category: 'audio',
    enabled: true,
    version: '2.0.4',
    author: 'AudioCore DSP',
    icon: 'Volume2',
    configurable: true,
    settings: {
      volume: 0.25,
      hapticPitch: 'medium'
    }
  },
  {
    id: 'token-ticker',
    name: 'Real-time Token Burn & Gas Ticker',
    description: 'Displays a live floating telemetry ticker calculating real-time tokens/sec, wattage, and compute cost ledger.',
    category: 'telemetry',
    enabled: true,
    version: '1.4.1',
    author: 'Cluster Telemetry Team',
    icon: 'Activity',
    configurable: true,
    settings: {
      refreshRateMs: 2000,
      showUsdCost: true
    }
  },
  {
    id: 'quake-terminal',
    name: 'Quake Dropdown Terminal HUD',
    description: 'Press the backtick key (`) anywhere in the app to slide down a live mission control command terminal.',
    category: 'utility',
    enabled: true,
    version: '1.0.8',
    author: 'DevOps Swarm',
    icon: 'Code2',
    configurable: true,
    settings: {
      hotkey: '`',
      fontSize: 12
    }
  },
  {
    id: 'orbit-radar',
    name: 'Cluster Neural Orbit Radar',
    description: 'Floating visual orbital radar displaying node clusters, agent latency vectors, and consensus rings.',
    category: 'visual',
    enabled: false,
    version: '1.1.0',
    author: 'Hermes Systems',
    icon: 'Radio',
    configurable: false
  },
  {
    id: 'custom-css-injector',
    name: 'Custom CSS & Variable Injector',
    description: 'Inject arbitrary custom CSS rules, layout tweaks, and font overrides directly into the live DOM.',
    category: 'utility',
    enabled: true,
    version: '1.0.0',
    author: 'Hermes Open Mod',
    icon: 'Sparkles',
    configurable: true
  }
];

const PLUGINS_STORAGE_KEY = 'hermes_custom_plugins_v1';
const CSS_STORAGE_KEY = 'hermes_custom_css_v1';

const PluginsContext = createContext<PluginsContextType | undefined>(undefined);

export const PluginsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plugins, setPlugins] = useState<CustomPlugin[]>(() => {
    try {
      const saved = localStorage.getItem(PLUGINS_STORAGE_KEY);
      if (saved) {
        const parsed: CustomPlugin[] = JSON.parse(saved);
        // Merge missing default plugins
        const existingIds = new Set(parsed.map(p => p.id));
        const merged = [...parsed];
        DEFAULT_PLUGINS.forEach(def => {
          if (!existingIds.has(def.id)) {
            merged.push(def);
          }
        });
        return merged;
      }
    } catch (e) {
      console.error('Failed to load plugins from localStorage', e);
    }
    return DEFAULT_PLUGINS;
  });

  const [customCss, setCustomCssState] = useState<string>(() => {
    try {
      return localStorage.getItem(CSS_STORAGE_KEY) || '/* Add your custom CSS here */\n/* Example: .cyber-glow { box-shadow: 0 0 20px rgba(76, 215, 246, 0.4); } */';
    } catch (e) {
      return '';
    }
  });

  // Persist plugins
  useEffect(() => {
    try {
      localStorage.setItem(PLUGINS_STORAGE_KEY, JSON.stringify(plugins));
    } catch (e) {
      console.error('Failed to save plugins', e);
    }
  }, [plugins]);

  // Inject custom CSS into DOM
  useEffect(() => {
    const isInjectorEnabled = plugins.find(p => p.id === 'custom-css-injector')?.enabled;
    let styleTag = document.getElementById('hermes-custom-css-injection') as HTMLStyleElement | null;
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'hermes-custom-css-injection';
      document.head.appendChild(styleTag);
    }

    if (isInjectorEnabled && customCss) {
      styleTag.textContent = customCss;
    } else {
      styleTag.textContent = '';
    }

    try {
      localStorage.setItem(CSS_STORAGE_KEY, customCss);
    } catch (e) {
      console.error('Failed to save custom css', e);
    }
  }, [customCss, plugins]);

  const togglePlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? { ...p, enabled: !p.enabled } : p));
  };

  const updatePluginSettings = (pluginId: string, settings: Record<string, any>) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? {
      ...p,
      settings: { ...(p.settings || {}), ...settings }
    } : p));
  };

  const isPluginEnabled = (pluginId: string): boolean => {
    const found = plugins.find(p => p.id === pluginId);
    return !!found?.enabled;
  };

  const addCustomPlugin = (newPlugin: CustomPlugin) => {
    setPlugins(prev => [newPlugin, ...prev]);
  };

  const setCustomCss = (css: string) => {
    setCustomCssState(css);
  };

  return (
    <PluginsContext.Provider
      value={{
        plugins,
        togglePlugin,
        updatePluginSettings,
        isPluginEnabled,
        addCustomPlugin,
        customCss,
        setCustomCss
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginsContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginsProvider');
  }
  return context;
};
