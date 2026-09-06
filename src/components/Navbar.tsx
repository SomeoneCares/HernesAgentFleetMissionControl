import React, { useState } from 'react';
import { TabType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCluster } from '../context/ClusterContext';
import { FleetSelectorDropdown } from './FleetSelectorDropdown';
import { 
  Terminal, 
  Bell, 
  Layers, 
  Palette,
  Server,
  LayoutDashboard,
  Bot,
  Kanban,
  MessageSquare,
  FolderGit2,
  Sparkles,
  User,
  Settings,
  Shield,
  Flame,
  Orbit,
  Cpu,
  Network,
  Zap
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCli: () => void;
  onOpenSkins: () => void;
  onOpenSelfHost: () => void;
  onOpenPet?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenCli,
  onOpenSkins,
  onOpenSelfHost,
  onOpenPet,
  onOpenProfile,
  onOpenSettings
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [ping, setPing] = useState(14);
  const { currentSkinMeta } = useTheme();
  const { activeAgents, activeTasks, operatorProfile, portalSettings } = useCluster();

  const branding = portalSettings?.branding || {
    portalName: 'HERMES',
    portalTagline: 'AUTONOMOUS MISSION CONTROL',
    organizationName: 'SOVEREIGN AGENT CLUSTER',
    versionBadge: 'OS 4.2',
    logoIcon: 'Layers',
    customLogoUrl: '',
    accentColor: '#4cd7f6',
    footerDisclaimer: 'HERMES PROTOCOL // AUTONOMOUS AGENT ORCHESTRATION',
    showOrgBadge: true
  };

  const renderBrandIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Terminal': return <Terminal className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Orbit': return <Orbit className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Network': return <Network className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Layers':
      default:
        return <Layers className={className} />;
    }
  };

  // Periodic subtle ping telemetry variation
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => 12 + Math.floor(Math.random() * 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: 'Live' },
    { id: 'agents', label: 'Agents Fleet', icon: Bot, badge: `${activeAgents.length} Agents` },
    { id: 'tasks', label: 'Tasks', icon: Kanban, badge: `${activeTasks.length} Kanban` },
    { id: 'chat', label: 'Comms & Chat', icon: MessageSquare, badge: 'Live' },
    { id: 'library', label: 'Content Library', icon: FolderGit2, badge: '18 Files' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090e]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
      {/* Top Tier: Brand, Global Status, and Primary Utilities */}
      <div className="max-w-[1720px] mx-auto h-16 px-4 sm:px-8 flex items-center justify-between gap-4 border-b border-white/[0.05]">
        {/* Brand & Cluster Aura Indicator */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button 
            id="navbar-brand-logo-btn"
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div 
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-500/5 border border-cyan-400/30 shadow-[0_0_20px_rgba(76,215,246,0.25)] group-hover:border-cyan-400/50 transition-all overflow-hidden"
              style={{ borderColor: branding.accentColor ? `${branding.accentColor}55` : undefined }}
            >
              {branding.customLogoUrl ? (
                <img 
                  src={branding.customLogoUrl} 
                  alt={branding.portalName} 
                  className="w-full h-full object-cover p-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                renderBrandIcon(branding.logoIcon, "w-5 h-5 text-cyan-400")
              )}
            </div>
            <div className="flex flex-col">
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                <span className="truncate max-w-[120px] sm:max-w-none">{branding.portalName || 'HERMES'}</span>
                <span 
                  className="text-[9px] font-mono font-medium tracking-widest text-cyan-400/90 uppercase px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 whitespace-nowrap"
                  style={{ color: branding.accentColor, borderColor: `${branding.accentColor}40`, backgroundColor: `${branding.accentColor}15` }}
                >
                  {branding.versionBadge || 'OS 4.2'}
                </span>
              </div>
              <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase truncate max-w-[160px] sm:max-w-none">
                {branding.portalTagline || 'AUTONOMOUS MISSION CONTROL'}
              </span>
            </div>
          </button>

          {branding.showOrgBadge && branding.organizationName && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span className="font-mono text-[10px] font-medium tracking-wide text-slate-300 uppercase">
                {branding.organizationName}
              </span>
            </div>
          )}

          <div className="h-4 w-px bg-white/10 hidden md:block" />

          {/* Minimalist Cluster Pulse */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#4edea3]"></span>
            </span>
            <span className="font-mono text-[10px] font-medium tracking-wide text-slate-300">
              {portalSettings?.connection?.clusterRegion || 'US-EAST-CORE-01'}
            </span>
            <span className="text-[9px] font-mono text-emerald-400 px-1 bg-emerald-400/10 rounded font-semibold">OPTIMAL</span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Fleet Selector Dropdown */}
          <FleetSelectorDropdown />
        </div>

        {/* Right Telemetry Status Pills & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden 2xl:flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-slate-400 text-[10px]">PING</span>
              <span className="text-cyan-400 font-semibold text-xs">{ping}ms</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-slate-400 text-[10px]">BURN</span>
              <span className="text-purple-300 font-semibold text-xs">4.2k <span className="text-[9px] font-normal text-slate-400">tps</span></span>
            </div>
          </div>

          {/* 1. Self-Host & Deploy Button */}
          <button
            onClick={onOpenSelfHost}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 transition-all text-xs font-mono group cursor-pointer"
            type="button"
            title="Zero-Server Self-Host & Deployment Guide"
          >
            <Server className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold hidden sm:inline">Self-Host</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-bold tracking-wider hidden md:inline">
              0 SERVERS
            </span>
          </button>

          {/* 2. Visual Skins Switcher Button */}
          <button
            onClick={onOpenSkins}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] hover:border-cyan-400/30 transition-all text-xs font-mono group cursor-pointer"
            type="button"
            title="Customize Visual Skins"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline font-medium">{currentSkinMeta.name.split(' ')[0]}</span>
            <div className="flex items-center -space-x-1">
              {currentSkinMeta.swatches.slice(1, 3).map((c, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-white/30"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </button>

          {/* 3. CLI Terminal Button */}
          <button
            onClick={onOpenCli}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 transition-all text-xs font-mono cursor-pointer"
            type="button"
            title="Open Hermes CLI Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">CLI</span>
          </button>

          {/* 4. Cyber Pet Assistant Launcher */}
          {onOpenPet && (
            <button
              onClick={onOpenPet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all text-xs font-mono cursor-pointer group"
              type="button"
              title="Configure Cyber Pet Companion"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:inline font-medium">Pet</span>
            </button>
          )}

          {/* 5. Portal & Cluster Settings Launcher */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-500/30 transition-all text-xs font-mono cursor-pointer group"
              type="button"
              title="Portal & Cluster Settings (Server RPC, Storage, Swarm Defaults, Plugins, Snapshots)"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden xl:inline font-medium">Settings</span>
            </button>
          )}

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all cursor-pointer"
              type="button"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#4cd7f6]" />
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#0c101a] border border-white/[0.12] p-4 shadow-2xl z-50 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                  <span className="font-semibold text-white tracking-wide">SYSTEM TELEMETRY ALERTS</span>
                  <span className="text-[10px] text-cyan-400 font-bold">2 UNREAD</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-emerald-400 font-bold">GPU NODE #02</span>
                      <span className="text-slate-500">14:28</span>
                    </div>
                    <p className="text-slate-300 text-xs">VRAM garbage collector freed 78.2 GB reclaimed headroom.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-cyan-400 font-bold">GATEWAY HTTP/3</span>
                      <span className="text-slate-500">14:15</span>
                    </div>
                    <p className="text-slate-300 text-xs">Dynamic context caching applied for hash #8f2a1b.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* User Profile (Clickable to edit operator profile & photo) */}
          <button
            onClick={onOpenProfile}
            type="button"
            className="flex items-center gap-2.5 pl-1 group text-left cursor-pointer focus:outline-none"
            title="Edit Operator Profile & Photo"
          >
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-xs font-semibold text-white tracking-tight leading-none group-hover:text-cyan-300 transition-colors">
                {operatorProfile.callsign}
              </span>
              <span className="font-mono text-[9px] text-emerald-400 tracking-wider mt-0.5 font-medium">
                {operatorProfile.authLevel}
              </span>
            </div>
            <div className="relative">
              <img
                alt={operatorProfile.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/20 group-hover:ring-cyan-400/70 transition-all shadow-md"
                src={operatorProfile.photoUrl || "https://lh3.googleusercontent.com/aida/AEtjO1U7CFA2eq11fTUZeYlVg8sdGaBUpUo8R8YW_po-HQqzWCwMbLkG_D6hx_LTIujJ5yDww68Lgn9IEP3JFK2BV5eBb4omBVUV8e5LWXjgHg0gQ-ES6Q0x6lJUIYe4CWAKDVnLiyYhwmm3yXGZG25AEhd_0GoJ1y3I9VXu69rhGqMBlgx73t6-wcLE6nWoGcZSAtlp9ug-4DSdJj_lx709t9I7CpMVj7Ma0Z7FkINXNA9dfCdDDVeiOfzd_pxM"}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07090e]"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Dedicated Second Tier: 5 High-Visibility Mission Control Tabs */}
      <div className="bg-[#07090e]/95 border-b border-white/[0.06] px-4 sm:px-8 py-2">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1.5 sm:gap-2 min-w-max mx-auto sm:mx-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2.5 cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-300 shadow-[0_0_15px_rgba(76,215,246,0.25)] border border-cyan-400/40 ring-1 ring-cyan-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="font-medium text-[13px]">{tab.label}</span>
                  {tab.badge && (
                    <span 
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isActive 
                          ? 'bg-cyan-400/25 text-cyan-200 border border-cyan-400/30 font-bold' 
                          : 'bg-white/[0.06] text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Tab Legend on wide screens */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
            <span>PORTAL:</span>
            <span className="text-slate-300 uppercase">{activeTab} VIEW ACTIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

