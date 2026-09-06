import React, { useState, useRef } from 'react';
import { useCluster } from '../context/ClusterContext';
import { TabType } from '../types';
import { 
  Settings, 
  Server, 
  HardDrive, 
  FolderGit2, 
  Sliders, 
  ShieldCheck, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Eye, 
  EyeOff, 
  Key, 
  Cpu, 
  Database, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  Lock, 
  FileJson,
  X,
  ExternalLink,
  Wifi,
  Layers,
  Archive,
  Puzzle,
  Terminal,
  Volume2,
  Code2,
  Plus,
  Palette,
  Shield,
  Flame,
  Orbit,
  Network,
  Zap,
  Bot
} from 'lucide-react';
import { usePlugins } from '../context/PluginsContext';
import { CustomPlugin } from '../types';

interface PortalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'connection' | 'storage' | 'branding' | 'preferences' | 'plugins' | 'backup';
}

export const PortalSettingsModal: React.FC<PortalSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'connection'
}) => {
  const {
    portalSettings,
    fleets,
    agents,
    tasks,
    artifacts,
    updateConnectionSettings,
    updateStorageSettings,
    updateBrandingSettings,
    updatePreferenceSettings,
    updateBackupSettings,
    exportClusterSnapshot,
    importClusterSnapshot,
    resetClusterToDefaults,
    testConnectionPing,
    showToast
  } = useCluster();

  const {
    plugins,
    togglePlugin,
    updatePluginSettings,
    addCustomPlugin,
    customCss,
    setCustomCss
  } = usePlugins();

  const [activeTab, setActiveTab] = useState<'connection' | 'storage' | 'branding' | 'preferences' | 'plugins' | 'backup'>(initialTab);
  const [pluginSubTab, setPluginSubTab] = useState<'installed' | 'custom-css' | 'new'>('installed');
  const [newPluginName, setNewPluginName] = useState('');
  const [newPluginDesc, setNewPluginDesc] = useState('');
  const [newPluginCat, setNewPluginCat] = useState<'visual' | 'audio' | 'telemetry' | 'utility'>('visual');

  const [showToken, setShowToken] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ latency: number; timestamp: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    fleetsCount: number;
    agentsCount: number;
    tasksCount: number;
    artifactsCount: number;
    timestamp: string;
    rawJson: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderBrandIcon = (iconName: string, className: string, customColor?: string) => {
    const style = customColor ? { color: customColor } : undefined;
    switch (iconName) {
      case 'Bot': return <Bot className={className} style={style} />;
      case 'Shield': return <Shield className={className} style={style} />;
      case 'Terminal': return <Terminal className={className} style={style} />;
      case 'Flame': return <Flame className={className} style={style} />;
      case 'Sparkles': return <Sparkles className={className} style={style} />;
      case 'Orbit': return <Orbit className={className} style={style} />;
      case 'Cpu': return <Cpu className={className} style={style} />;
      case 'Network': return <Network className={className} style={style} />;
      case 'Zap': return <Zap className={className} style={style} />;
      case 'Layers':
      default:
        return <Layers className={className} style={style} />;
    }
  };

  const handleCreatePlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName.trim()) return;

    const newId = `user-plugin-${Date.now()}`;
    const plugin: CustomPlugin = {
      id: newId,
      name: newPluginName.trim(),
      description: newPluginDesc.trim() || 'User defined custom UI extension.',
      category: newPluginCat,
      enabled: true,
      version: '1.0.0',
      author: 'Operator (Local)',
      icon: 'Sparkles',
      configurable: false
    };

    addCustomPlugin(plugin);
    setNewPluginName('');
    setNewPluginDesc('');
    setPluginSubTab('installed');
    showToast(`Extension "${plugin.name}" registered & enabled`);
  };

  const getPluginIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-4 h-4 text-cyan-400" />;
      case 'Volume2': return <Volume2 className="w-4 h-4 text-emerald-400" />;
      case 'Activity': return <Wifi className="w-4 h-4 text-purple-400" />;
      case 'Code2': return <Code2 className="w-4 h-4 text-amber-400" />;
      case 'Radio': return <Radio className="w-4 h-4 text-pink-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  if (!isOpen) return null;

  const handlePingTest = async () => {
    setIsPinging(true);
    try {
      const latency = await testConnectionPing();
      setPingResult({
        latency,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (e) {
      showToast('Connection handshake probe failed');
    } finally {
      setIsPinging(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setImportPreview({
          fleetsCount: Array.isArray(parsed.fleets) ? parsed.fleets.length : 0,
          agentsCount: Array.isArray(parsed.agents) ? parsed.agents.length : 0,
          tasksCount: Array.isArray(parsed.tasks) ? parsed.tasks.length : 0,
          artifactsCount: Array.isArray(parsed.artifacts) ? parsed.artifacts.length : 0,
          timestamp: parsed.exportTimestamp || 'Unknown Date',
          rawJson: text
        });
      } catch (err) {
        showToast('Invalid JSON snapshot file');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    const ok = importClusterSnapshot(importPreview.rawJson);
    if (ok) {
      setImportPreview(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#090d16] border border-white/[0.12] rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(76,215,246,0.2)]">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide font-mono">
                  PORTAL & CLUSTER SETTINGS
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-semibold">
                  HERMES OS 4.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Server RPC endpoint, storage directories, startup swarm routing, and backup snapshots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>DAEMON: {portalSettings.connection.connectionStatus}</span>
              <span className="text-[10px] text-slate-400 font-normal">({portalSettings.connection.lastHeartbeatPingMs}ms)</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Close Settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-white/[0.08] flex items-center gap-2 bg-black/40 overflow-x-auto no-scrollbar">
          {[
            { id: 'connection', label: 'Hermes Server & RPC', icon: Server },
            { id: 'branding', label: 'Portal Branding & Identity', icon: Palette },
            { id: 'storage', label: 'Content Library & Volumes', icon: FolderGit2 },
            { id: 'preferences', label: 'Swarm Defaults & UI', icon: Sliders },
            { id: 'plugins', label: `Plugins & Extensions (${plugins.filter(p => p.enabled).length})`, icon: Puzzle },
            { id: 'backup', label: 'Snapshots & Recovery', icon: Archive }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-mono text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'border-cyan-400 text-cyan-300 font-semibold bg-cyan-400/[0.04]' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
          {/* TAB 1: HERMES SERVER & RPC */}
          {activeTab === 'connection' && (
            <div className="space-y-6 animate-fade-in">
              {/* Connection Status Banner */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Active Host Endpoint</span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-semibold">
                        {portalSettings.connection.clusterRegion}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Binding URI: <code className="text-cyan-300 bg-white/[0.05] px-1.5 py-0.5 rounded">{portalSettings.connection.serverUrl}</code> via <span className="text-purple-300 font-semibold">{portalSettings.connection.protocol}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePingTest}
                    disabled={isPinging}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white transition-all cursor-pointer font-semibold shadow-[0_0_15px_rgba(76,215,246,0.15)] disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Pinging Daemon...' : 'Test Latency Ping'}</span>
                  </button>
                </div>
              </div>

              {pingResult && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Handshake Verified: Hermes Agent Host responded in <strong>{pingResult.latency}ms</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400">{pingResult.timestamp}</span>
                </div>
              )}

              {/* Server Endpoint URL */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold tracking-wide flex items-center justify-between">
                  <span>HERMES DAEMON / SERVER ENDPOINT</span>
                  <span className="text-slate-500 text-[10px] font-normal">Base RPC URL or IP Socket</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={portalSettings.connection.serverUrl}
                    onChange={(e) => updateConnectionSettings({ serverUrl: e.target.value })}
                    placeholder="http://localhost:8080 or https://hermes.internal:8443"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  />
                </div>

                {/* Preset Fast Selectors */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-slate-500 text-[10px]">PRESETS:</span>
                  {[
                    { label: 'Local Daemon (8080)', url: 'http://localhost:8080' },
                    { label: 'Local Dev (3000)', url: 'http://localhost:3000' },
                    { label: 'Remote Kubernetes Cluster (8443)', url: 'https://cluster.hermes.internal:8443' },
                    { label: 'Hermes Cloud Sovereign', url: 'https://api.hermes-agent.io/v1' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => updateConnectionSettings({ serverUrl: preset.url })}
                      className="px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/[0.08] hover:border-cyan-400/30 text-[10px] text-slate-400 transition-all cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Protocol & Cluster Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">TRANSPORT PROTOCOL</label>
                  <select
                    value={portalSettings.connection.protocol}
                    onChange={(e) => updateConnectionSettings({ protocol: e.target.value as any })}
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="HTTP_REST">HTTP REST + Server-Sent Events (SSE)</option>
                    <option value="WEBSOCKET">Direct Bi-Directional WebSocket (WS / WSS)</option>
                    <option value="GRPC_WEB">gRPC-Web (Binary Protocol Buffers)</option>
                    <option value="UNIX_SOCKET">UNIX Domain Socket (/var/run/hermes.sock)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    WebSocket provides sub-10ms neural event telemetry and live streaming agent thoughts.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">CLUSTER REGION / NODE POOL</label>
                  <input
                    type="text"
                    value={portalSettings.connection.clusterRegion}
                    onChange={(e) => updateConnectionSettings({ clusterRegion: e.target.value })}
                    placeholder="US-EAST-CORE-01"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Designation tag displayed on telemetry headers and agent audit logs.
                  </p>
                </div>
              </div>

              {/* Server Auth Bearer Token */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold flex items-center justify-between">
                  <span>AGENT SERVER AUTH TOKEN (BEARER / API KEY)</span>
                  <button
                    onClick={() => {
                      const randToken = 'hermes-live-sk-' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 8);
                      updateConnectionSettings({ authToken: randToken });
                      showToast('Generated new client bearer token');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Generate New Token</span>
                  </button>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={portalSettings.connection.authToken}
                    onChange={(e) => updateConnectionSettings({ authToken: e.target.value })}
                    placeholder="hermes-live-sk-..."
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 pr-10 text-white font-mono text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Transmitted securely in <code className="text-slate-400">Authorization: Bearer &lt;token&gt;</code> on every gRPC and HTTP invocation.
                </p>
              </div>

              {/* Toggles: TLS and Heartbeat Interval */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Strict TLS Certificate Validation</span>
                    <p className="text-[10px] text-slate-400">Reject unauthorized self-signed SSL certs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalSettings.connection.verifyTls}
                      onChange={(e) => updateConnectionSettings({ verifyTls: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Heartbeat Ping Interval</span>
                    <span className="text-cyan-400 font-bold">{portalSettings.connection.heartbeatIntervalSec}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={portalSettings.connection.heartbeatIntervalSec}
                    onChange={(e) => updateConnectionSettings({ heartbeatIntervalSec: Number(e.target.value) })}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">Frequency of liveness probes to the daemon</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT LIBRARY & STORAGE VOLUMES */}
          {activeTab === 'storage' && (
            <div className="space-y-6 animate-fade-in">
              {/* Storage Overview Card */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Artifacts & Vector Storage Volume</span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-400/20 text-purple-300 text-[10px] font-semibold">
                        {artifacts.length} FILES INDEXED
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Mounted Path: <code className="text-purple-300 bg-white/[0.05] px-1.5 py-0.5 rounded">{portalSettings.storage.libraryFolderPath}</code>
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">ALLOCATED QUOTA</div>
                  <div className="text-base font-bold text-white">{portalSettings.storage.storageQuotaGb} GB <span className="text-[10px] text-slate-500 font-normal">(4.2 MB used)</span></div>
                </div>
              </div>

              {/* Local Directory Mount Path */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold flex items-center justify-between">
                  <span>LOCAL CONTENT LIBRARY ROOT DIRECTORY</span>
                  <span className="text-slate-500 text-[10px]">Host filesystem volume mount</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={portalSettings.storage.libraryFolderPath}
                    onChange={(e) => updateStorageSettings({ libraryFolderPath: e.target.value })}
                    placeholder="/var/lib/hermes/artifacts"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-purple-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-slate-500 text-[10px]">RECOMMENDED PATHS:</span>
                  {[
                    '/var/lib/hermes/swarm-artifacts',
                    '/opt/hermes/data/content',
                    '~/.hermes/workspace/artifacts',
                    '/mnt/shared-nfs/agents/vault'
                  ].map(p => (
                    <button
                      key={p}
                      onClick={() => updateStorageSettings({ libraryFolderPath: p })}
                      className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-purple-500/10 hover:text-purple-300 border border-white/[0.08] text-[10px] text-slate-400 transition-all cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* IPFS Gateway & S3 Endpoint */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">IPFS GATEWAY (DECENTRALIZED CIDs)</label>
                  <input
                    type="text"
                    value={portalSettings.storage.ipfsGatewayUrl}
                    onChange={(e) => updateStorageSettings({ ipfsGatewayUrl: e.target.value })}
                    placeholder="https://ipfs.io/ipfs/"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-purple-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Resolves cryptographic SHA hashes for immutable document versions.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">S3 / MINIO OBJECT VAULT BUCKET</label>
                  <input
                    type="text"
                    value={portalSettings.storage.s3BucketEndpoint || ''}
                    onChange={(e) => updateStorageSettings({ s3BucketEndpoint: e.target.value })}
                    placeholder="s3://hermes-cluster-vault/production/"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-purple-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    S3-compatible bucket URI for long-term cold storage replication.
                  </p>
                </div>
              </div>

              {/* Quota & Retention Policies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Disk Storage Quota</span>
                    <span className="text-purple-400 font-bold">{portalSettings.storage.storageQuotaGb} GB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={portalSettings.storage.storageQuotaGb}
                    onChange={(e) => updateStorageSettings({ storageQuotaGb: Number(e.target.value) })}
                    className="w-full accent-purple-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">Maximum local storage footprint for generated documents & models</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">AUTO-PURGE CACHE RETENTION</label>
                  <select
                    value={portalSettings.storage.autoPurgeDays}
                    onChange={(e) => updateStorageSettings({ autoPurgeDays: Number(e.target.value) })}
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-purple-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value={0}>Never Auto-Purge (Keep Forever)</option>
                    <option value={7}>Purge Cold Artifacts Older than 7 Days</option>
                    <option value={14}>Purge Cold Artifacts Older than 14 Days</option>
                    <option value={30}>Purge Cold Artifacts Older than 30 Days (Standard)</option>
                    <option value={90}>Purge Cold Artifacts Older than 90 Days</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Automatically transitions cached files to cold archive</p>
                </div>
              </div>

              {/* Compression & Vector Index Memory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">ZStandard Artifact Compression</span>
                    <p className="text-[10px] text-slate-400">Compress docx, xlsx, json files on disk</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalSettings.storage.compressOnIngest}
                      onChange={(e) => updateStorageSettings({ compressOnIngest: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">In-Memory Vector Cache</span>
                    <span className="text-purple-400 font-bold">{portalSettings.storage.vectorIndexMemoryMb} MB</span>
                  </div>
                  <input
                    type="range"
                    min="512"
                    max="8192"
                    step="256"
                    value={portalSettings.storage.vectorIndexMemoryMb}
                    onChange={(e) => updateStorageSettings({ vectorIndexMemoryMb: Number(e.target.value) })}
                    className="w-full accent-purple-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">RAM headroom reserved for fast cosine similarity semantic search</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PORTAL BRANDING & IDENTITY */}
          {activeTab === 'branding' && (
            <div className="space-y-6 animate-fade-in">
              {/* Tab Banner */}
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">Mission Control Branding & Visual Identity</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Personalize your portal name, tactical release badge, organization insignia, brand logo emblem, and compliance disclaimer.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateBrandingSettings({
                      portalName: 'HERMES',
                      portalTagline: 'AUTONOMOUS MISSION CONTROL',
                      organizationName: 'SOVEREIGN AGENT CLUSTER',
                      versionBadge: 'OS 4.2',
                      logoIcon: 'Layers',
                      customLogoUrl: '',
                      accentColor: '#4cd7f6',
                      footerDisclaimer: 'HERMES PROTOCOL // AUTONOMOUS AGENT ORCHESTRATION',
                      showOrgBadge: true
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset branding to defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Live Brand Preview Card */}
              <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.1] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    LIVE HEADER PREVIEW
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Simulated Top Navigation</span>
                </div>

                <div className="p-4 rounded-xl bg-[#07090e] border border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-lg overflow-hidden bg-gradient-to-br from-cyan-400/20 to-cyan-500/5"
                      style={{ borderColor: portalSettings.branding.accentColor ? `${portalSettings.branding.accentColor}66` : '#4cd7f666' }}
                    >
                      {portalSettings.branding.customLogoUrl ? (
                        <img 
                          src={portalSettings.branding.customLogoUrl} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover p-1"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        renderBrandIcon(portalSettings.branding.logoIcon, "w-5 h-5", portalSettings.branding.accentColor)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                        <span>{portalSettings.branding.portalName || 'HERMES'}</span>
                        <span 
                          className="text-[9px] font-mono font-medium tracking-widest uppercase px-1.5 py-0.5 rounded border"
                          style={{ 
                            color: portalSettings.branding.accentColor || '#4cd7f6',
                            borderColor: `${portalSettings.branding.accentColor || '#4cd7f6'}40`,
                            backgroundColor: `${portalSettings.branding.accentColor || '#4cd7f6'}15`
                          }}
                        >
                          {portalSettings.branding.versionBadge || 'OS 4.2'}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 tracking-wider uppercase">
                        {portalSettings.branding.portalTagline || 'AUTONOMOUS MISSION CONTROL'}
                      </span>
                    </div>
                  </div>

                  {portalSettings.branding.showOrgBadge && portalSettings.branding.organizationName && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1]">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <span className="font-mono text-[10px] text-slate-300 uppercase">
                        {portalSettings.branding.organizationName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between flex-wrap gap-2">
                  <span>Footer Disclaimer: <code className="text-slate-300">© {new Date().getFullYear()} {portalSettings.branding.footerDisclaimer}</code></span>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">CURATED BRAND THEME PRESETS</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      name: 'Hermes Cyber Core',
                      portalName: 'HERMES',
                      versionBadge: 'OS 4.2',
                      portalTagline: 'AUTONOMOUS MISSION CONTROL',
                      logoIcon: 'Layers',
                      accentColor: '#4cd7f6',
                      orgName: 'SOVEREIGN AGENT CLUSTER'
                    },
                    {
                      name: 'Titan Deep Space',
                      portalName: 'TITAN',
                      versionBadge: 'ORBIT 4.0',
                      portalTagline: 'ORBITAL AGENT FLEET',
                      logoIcon: 'Orbit',
                      accentColor: '#38bdf8',
                      orgName: 'DEEP SPACE EXPEDITION'
                    },
                    {
                      name: 'Matrix Neural Mesh',
                      portalName: 'MATRIX',
                      versionBadge: 'CORE v3',
                      portalTagline: 'DISTRIBUTED AGENT CLUSTER',
                      logoIcon: 'Terminal',
                      accentColor: '#10b981',
                      orgName: 'NEURAL COMPUTING DIVISION'
                    },
                    {
                      name: 'Aegis Sentinel',
                      portalName: 'AEGIS',
                      versionBadge: 'DEF-9',
                      portalTagline: 'SOVEREIGN DEFENSE PROTOCOL',
                      logoIcon: 'Shield',
                      accentColor: '#f59e0b',
                      orgName: 'SEC-OPERATIONS COMMAND'
                    }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => updateBrandingSettings({
                        portalName: preset.portalName,
                        versionBadge: preset.versionBadge,
                        portalTagline: preset.portalTagline,
                        logoIcon: preset.logoIcon,
                        accentColor: preset.accentColor,
                        organizationName: preset.orgName
                      })}
                      className="p-3 rounded-xl bg-[#05080f] border border-white/[0.08] hover:border-cyan-400/50 text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                          {preset.name}
                        </span>
                        <span 
                          className="w-3 h-3 rounded-full border border-white/20" 
                          style={{ backgroundColor: preset.accentColor }} 
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        <div>{preset.portalName} <span className="text-slate-500">[{preset.versionBadge}]</span></div>
                        <div className="truncate text-slate-500 text-[9px] mt-0.5">{preset.portalTagline}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Configuration Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Portal Name */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">PORTAL CALLSIGN / NAME</label>
                  <input
                    type="text"
                    value={portalSettings.branding.portalName}
                    onChange={(e) => updateBrandingSettings({ portalName: e.target.value })}
                    placeholder="e.g. HERMES"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Primary mission control name displayed in top left header</p>
                </div>

                {/* Version Tag */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">VERSION / TACTICAL BADGE</label>
                  <input
                    type="text"
                    value={portalSettings.branding.versionBadge}
                    onChange={(e) => updateBrandingSettings({ versionBadge: e.target.value })}
                    placeholder="e.g. OS 4.2"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none text-cyan-300 font-bold"
                  />
                  <p className="text-[10px] text-slate-500">Micro badge appended next to portal name</p>
                </div>

                {/* Tagline */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">SUBTITLE / TAGLINE</label>
                  <input
                    type="text"
                    value={portalSettings.branding.portalTagline}
                    onChange={(e) => updateBrandingSettings({ portalTagline: e.target.value })}
                    placeholder="e.g. AUTONOMOUS MISSION CONTROL"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">Sub-heading descriptor shown below the portal title</p>
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">ORGANIZATION / COMMAND DIVISION</label>
                  <input
                    type="text"
                    value={portalSettings.branding.organizationName}
                    onChange={(e) => updateBrandingSettings({ organizationName: e.target.value })}
                    placeholder="e.g. SOVEREIGN AGENT CLUSTER"
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="toggle-show-org-badge"
                      checked={portalSettings.branding.showOrgBadge}
                      onChange={(e) => updateBrandingSettings({ showOrgBadge: e.target.checked })}
                      className="rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="toggle-show-org-badge" className="text-[11px] text-slate-400 cursor-pointer">
                      Display organization insignia badge in top navbar
                    </label>
                  </div>
                </div>
              </div>

              {/* Brand Logo Emblem Selector */}
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">PORTAL EMBLEM / LOGO ICON</label>
                  <span className="text-[10px] text-slate-500 font-mono">10 Cybernetic Icons</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {[
                    { id: 'Layers', label: 'Layers' },
                    { id: 'Bot', label: 'Bot' },
                    { id: 'Shield', label: 'Shield' },
                    { id: 'Terminal', label: 'Terminal' },
                    { id: 'Flame', label: 'Flame' },
                    { id: 'Sparkles', label: 'Sparkles' },
                    { id: 'Orbit', label: 'Orbit' },
                    { id: 'Cpu', label: 'CPU' },
                    { id: 'Network', label: 'Network' },
                    { id: 'Zap', label: 'Zap' }
                  ].map((item) => {
                    const isSelected = portalSettings.branding.logoIcon === item.id && !portalSettings.branding.customLogoUrl;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateBrandingSettings({ logoIcon: item.id, customLogoUrl: '' })}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/30'
                        }`}
                        title={`Use ${item.label} emblem`}
                      >
                        {renderBrandIcon(item.id, "w-5 h-5")}
                        <span className="text-[9px] font-mono">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Logo URL option */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <label className="block text-slate-300 text-[11px] font-semibold">CUSTOM EMBLEM IMAGE / SVG URL (OPTIONAL)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={portalSettings.branding.customLogoUrl || ''}
                      onChange={(e) => updateBrandingSettings({ customLogoUrl: e.target.value })}
                      placeholder="https://example.com/brand-logo.svg"
                      className="flex-1 bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                    />
                    {portalSettings.branding.customLogoUrl && (
                      <button
                        type="button"
                        onClick={() => updateBrandingSettings({ customLogoUrl: '' })}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">Provide an HTTPS URL to a custom SVG or transparent PNG logo. If set, this overrides the vector icon.</p>
                </div>
              </div>

              {/* Brand Accent Color Swatches */}
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <label className="block text-slate-300 font-semibold">BRAND ACCENT COLOR</label>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { label: 'Cyan Core', hex: '#4cd7f6' },
                    { label: 'Emerald Mesh', hex: '#10b981' },
                    { label: 'Sovereign Purple', hex: '#a855f7' },
                    { label: 'Warning Amber', hex: '#f59e0b' },
                    { label: 'Crimson Cyber', hex: '#f43f5e' },
                    { label: 'Electric Sky', hex: '#38bdf8' },
                    { label: 'Ultra Violet', hex: '#8b5cf6' }
                  ].map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => updateBrandingSettings({ accentColor: color.hex })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        portalSettings.branding.accentColor === color.hex
                          ? 'border-white text-white bg-white/[0.1] ring-2 ring-white/20'
                          : 'border-white/10 text-slate-300 hover:border-white/30 bg-black/40'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color.hex }} />
                      <span className="font-mono text-[11px]">{color.label}</span>
                    </button>
                  ))}

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[11px] text-slate-400 font-mono">Custom Hex:</span>
                    <input
                      type="text"
                      value={portalSettings.branding.accentColor}
                      onChange={(e) => updateBrandingSettings({ accentColor: e.target.value })}
                      className="w-24 bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Disclaimer & Compliance Notice */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">FOOTER DISCLAIMER & COPYRIGHT NOTICE</label>
                <input
                  type="text"
                  value={portalSettings.branding.footerDisclaimer}
                  onChange={(e) => updateBrandingSettings({ footerDisclaimer: e.target.value })}
                  placeholder="e.g. HERMES PROTOCOL // AUTONOMOUS AGENT ORCHESTRATION"
                  className="w-full bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">Appears in the sticky bottom footer bar across all mission control tabs</p>
              </div>
            </div>
          )}

          {/* TAB 3: SWARM DEFAULTS & UI */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">Swarm Initialization & Navigation Defaults</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Configure which fleet and landing tab are mounted automatically upon session start.
                    </p>
                  </div>
                </div>
              </div>

              {/* Default Fleet and Default Landing Tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">DEFAULT STARTUP FLEET</label>
                  <select
                    value={portalSettings.preferences.defaultFleetId}
                    onChange={(e) => updatePreferenceSettings({ defaultFleetId: e.target.value })}
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="all">Federated View (All Fleets Combined)</option>
                    {fleets.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} [{f.codename}] - {f.purpose}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">
                    The active fleet context loaded whenever an operator opens the mission console.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">DEFAULT INITIAL SCREEN / TAB</label>
                  <select
                    value={portalSettings.preferences.defaultLandingTab}
                    onChange={(e) => updatePreferenceSettings({ defaultLandingTab: e.target.value as TabType })}
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="overview">Overview Mission Control</option>
                    <option value="agents">Agents Fleet & Neural Hierarchy</option>
                    <option value="tasks">Tasks & Orchestration Board</option>
                    <option value="chat">Comms & Live Agent Chat</option>
                    <option value="library">Content & Artifacts Library</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    The primary viewport rendered when the dashboard loads.
                  </p>
                </div>
              </div>

              {/* Telemetry Log Buffer and Refresh Interval */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold">TELEMETRY LOG STREAM RETENTION</label>
                  <select
                    value={portalSettings.preferences.telemetryLogRetention}
                    onChange={(e) => updatePreferenceSettings({ telemetryLogRetention: Number(e.target.value) })}
                    className="w-full bg-[#05080f] border border-white/[0.12] focus:border-emerald-400 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value={250}>Keep Last 250 Events (Ultra Low Memory)</option>
                    <option value={500}>Keep Last 500 Events</option>
                    <option value={1000}>Keep Last 1,000 Events (Recommended)</option>
                    <option value={5000}>Keep Last 5,000 Events (Deep Debugging)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Caps maximum events retained in live agent activity log</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Telemetry Polling Frequency</span>
                    <span className="text-emerald-400 font-bold">{portalSettings.preferences.refreshIntervalSec}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={portalSettings.preferences.refreshIntervalSec}
                    onChange={(e) => updatePreferenceSettings({ refreshIntervalSec: Number(e.target.value) })}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">Rate of VRAM, throughput, and ping telemetry updates</p>
                </div>
              </div>

              {/* Sound Alerts and Saturation Threshold */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Acoustic Alerts for P1 Incidents</span>
                    <p className="text-[10px] text-slate-400">Play subtle audio alert on critical error or breach</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalSettings.preferences.soundAlertsEnabled}
                      onChange={(e) => updatePreferenceSettings({ soundAlertsEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Auto-Rebalance Saturation Threshold</span>
                    <span className="text-emerald-400 font-bold">{portalSettings.preferences.autoRebalanceSatThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="98"
                    step="1"
                    value={portalSettings.preferences.autoRebalanceSatThreshold}
                    onChange={(e) => updatePreferenceSettings({ autoRebalanceSatThreshold: Number(e.target.value) })}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">Triggers greedy load redistribution when fleet queue exceeds capacity</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLUGINS & EXTENSIONS */}
          {activeTab === 'plugins' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Overview Card */}
              <div className="p-5 rounded-2xl bg-[#0e1422] border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Puzzle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      Modular UI Extensions & Custom Plugins
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                        {plugins.filter(p => p.enabled).length} / {plugins.length} ACTIVE
                      </span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
                      Extend Hermes mission control with ambient visual engines, audio synthesizers, terminal hooks, telemetry tickers, and live CSS stylesheets.
                    </p>
                  </div>
                </div>

                {/* Sub-nav buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.08] rounded-xl font-mono text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setPluginSubTab('installed')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      pluginSubTab === 'installed'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Installed ({plugins.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPluginSubTab('custom-css')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      pluginSubTab === 'custom-css'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Custom CSS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPluginSubTab('new')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      pluginSubTab === 'new'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register New</span>
                  </button>
                </div>
              </div>

              {/* Subtab 1: Installed Plugins List */}
              {pluginSubTab === 'installed' && (
                <div className="space-y-3">
                  {plugins.map(plugin => (
                    <div
                      key={plugin.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        plugin.enabled
                          ? 'bg-white/[0.03] border-cyan-400/30 ring-1 ring-cyan-400/15'
                          : 'bg-white/[0.01] border-white/[0.06] opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 shrink-0">
                            {getPluginIcon(plugin.icon)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-bold text-white text-xs">{plugin.name}</span>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">
                                v{plugin.version}
                              </span>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-300">
                                {plugin.category}
                              </span>
                              {plugin.enabled && (
                                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  RUNNING
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                              {plugin.description}
                            </p>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Author: <span className="text-slate-400">{plugin.author}</span>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={plugin.enabled}
                            onChange={() => togglePlugin(plugin.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                        </label>
                      </div>

                      {/* Configurable Sliders & Parameters */}
                      {plugin.enabled && plugin.configurable && plugin.settings && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-5 text-[11px] text-slate-300">
                          {plugin.id === 'matrix-rain' && (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Matrix Opacity:</span>
                                <input
                                  type="range"
                                  min="0.05"
                                  max="0.4"
                                  step="0.02"
                                  value={plugin.settings.opacity || 0.14}
                                  onChange={(e) => updatePluginSettings(plugin.id, { opacity: parseFloat(e.target.value) })}
                                  className="w-24 accent-cyan-400"
                                />
                                <span className="text-cyan-300 font-mono text-[10px]">
                                  {Math.round((plugin.settings.opacity || 0.14) * 100)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Rain Tint:</span>
                                <input
                                  type="color"
                                  value={plugin.settings.color || '#4cd7f6'}
                                  onChange={(e) => updatePluginSettings(plugin.id, { color: e.target.value })}
                                  className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                                />
                                <span className="text-slate-400 font-mono text-[10px] uppercase">
                                  {plugin.settings.color || '#4cd7f6'}
                                </span>
                              </div>
                            </>
                          )}

                          {plugin.id === 'sound-synth' && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Master Volume:</span>
                              <input
                                type="range"
                                min="0.05"
                                max="0.8"
                                step="0.05"
                                value={plugin.settings.volume || 0.25}
                                onChange={(e) => updatePluginSettings(plugin.id, { volume: parseFloat(e.target.value) })}
                                className="w-28 accent-emerald-400"
                              />
                              <span className="text-emerald-300 font-mono text-[10px]">
                                {Math.round((plugin.settings.volume || 0.25) * 100)}%
                              </span>
                            </div>
                          )}

                          {plugin.id === 'token-ticker' && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={plugin.settings.showUsdCost !== false}
                                onChange={(e) => updatePluginSettings(plugin.id, { showUsdCost: e.target.checked })}
                                className="rounded accent-purple-400"
                              />
                              <span className="text-slate-300">Display USD Burn Rate Estimate</span>
                            </label>
                          )}

                          {plugin.id === 'quake-terminal' && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Summon Shortcut:</span>
                              <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-cyan-300 font-mono font-bold">
                                ` (Backtick)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Subtab 2: Custom CSS Injector */}
              {pluginSubTab === 'custom-css' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-cyan-400" />
                          <span>Custom Runtime CSS Injector</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            LIVE INJECTED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Inject custom CSS styling rules directly into the application DOM runtime without needing a rebuild.
                        </p>
                      </div>

                      <button
                        onClick={() => setCustomCss('/* Custom CSS Rules */\n')}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 cursor-pointer self-start sm:self-auto"
                        type="button"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear Rules</span>
                      </button>
                    </div>

                    {/* Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                      <span className="text-[10px] text-slate-500 font-mono">QUICK PRESETS:</span>
                      <button
                        type="button"
                        onClick={() => setCustomCss(prev => `${prev}\n/* Neon Cyan Glow */\n.card-neon { box-shadow: 0 0 20px rgba(76, 215, 246, 0.25) !important; }\n`)}
                        className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono transition-all cursor-pointer"
                      >
                        + Neon Glow
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCss(prev => `${prev}\n/* Subtle Scanlines */\nbody::after { content: ""; position: fixed; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px); z-index: 9999; }\n`)}
                        className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono transition-all cursor-pointer"
                      >
                        + Scanlines Overlay
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCss(prev => `${prev}\n/* Emerald Terminal Accent */\n:root { --accent-primary: #10b981; }\n`)}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono transition-all cursor-pointer"
                      >
                        + Emerald Theme Accent
                      </button>
                    </div>

                    <textarea
                      value={customCss}
                      onChange={(e) => setCustomCss(e.target.value)}
                      rows={11}
                      className="w-full p-4 rounded-xl bg-[#05080f] border border-white/10 text-emerald-300 font-mono text-xs focus:outline-none focus:border-cyan-400/50 leading-relaxed shadow-inner"
                      placeholder="/* Enter custom CSS rules */&#10;.custom-glow { filter: drop-shadow(0 0 10px #4cd7f6); }"
                    />
                  </div>
                </div>
              )}

              {/* Subtab 3: Register New Extension */}
              {pluginSubTab === 'new' && (
                <form onSubmit={handleCreatePlugin} className="p-5 rounded-2xl bg-black/40 border border-white/[0.08] space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-xs mb-1">Register Modular Extension</h3>
                    <p className="text-[11px] text-slate-400">
                      Register a custom UI hook definition to integrate with your Hermes mission control workspace.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Extension Name:</label>
                      <input
                        type="text"
                        required
                        value={newPluginName}
                        onChange={(e) => setNewPluginName(e.target.value)}
                        placeholder="e.g. Latency Heatmap Overlay"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400/50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Description:</label>
                      <input
                        type="text"
                        value={newPluginDesc}
                        onChange={(e) => setNewPluginDesc(e.target.value)}
                        placeholder="Functional description of this extension"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400/50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Category:</label>
                      <select
                        value={newPluginCat}
                        onChange={(e) => setNewPluginCat(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                      >
                        <option value="visual">Visual Display Engine</option>
                        <option value="audio">Audio Synthesizer</option>
                        <option value="telemetry">Telemetry & Analytics</option>
                        <option value="utility">Operator Utility</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:opacity-95 text-[#07090e] font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Extension</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: SNAPSHOTS, BACKUP & RECOVERY */}
          {activeTab === 'backup' && (
            <div className="space-y-6 animate-fade-in">
              {/* Export Snapshot Card */}
              <div className="p-5 rounded-2xl bg-[#0e1422] border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Full Cluster Snapshot Export</h3>
                    <p className="text-slate-400 text-xs mt-0.5 max-w-lg">
                      Generate an authenticated archive containing all {fleets.length} fleets, {agents.length} agents, {tasks.length} tasks, routing rules, and portal settings.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400">LAST BACKUP: <strong className="text-slate-200">{portalSettings.backup.lastBackupTimestamp || 'None'}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] text-cyan-400 font-mono">JSON ENCODED (SHA-256)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={exportClusterSnapshot}
                  className="w-full md:w-auto px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(76,215,246,0.3)] shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Snapshot</span>
                </button>
              </div>

              {/* Restore Snapshot Card */}
              <div className="p-5 rounded-2xl bg-[#0e1422] border border-white/[0.08] shadow-lg space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Restore Cluster from Snapshot</h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Upload a previously exported <code className="text-purple-300">.json</code> snapshot to rollback configuration, recover corrupted agent memories, or restore tasks.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shrink-0 font-semibold"
                  >
                    <FileJson className="w-4 h-4 text-purple-400" />
                    <span>Select Snapshot File</span>
                  </button>
                </div>

                {/* Import Preview Modal / Verification Box */}
                {importPreview && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-400/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-purple-400/20 pb-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        Valid Snapshot Detected
                      </span>
                      <span className="text-[10px] text-slate-400">Created: {importPreview.timestamp}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/[0.05]">
                        <div className="text-sm font-bold text-cyan-400">{importPreview.fleetsCount}</div>
                        <div className="text-[10px] text-slate-400">Fleets</div>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/[0.05]">
                        <div className="text-sm font-bold text-emerald-400">{importPreview.agentsCount}</div>
                        <div className="text-[10px] text-slate-400">Agents</div>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/[0.05]">
                        <div className="text-sm font-bold text-purple-400">{importPreview.tasksCount}</div>
                        <div className="text-[10px] text-slate-400">Tasks</div>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/[0.05]">
                        <div className="text-sm font-bold text-amber-400">{importPreview.artifactsCount}</div>
                        <div className="text-[10px] text-slate-400">Artifacts</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => setImportPreview(null)}
                        className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmImport}
                        className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md"
                      >
                        Confirm & Restore State
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Automated Snapshot Scheduling */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Automated Snapshot Schedule</span>
                    <p className="text-[10px] text-slate-400">Periodic cluster backups saved to local and remote replica</p>
                  </div>
                  <select
                    value={portalSettings.backup.autoBackupSchedule}
                    onChange={(e) => updateBackupSettings({ autoBackupSchedule: e.target.value as any })}
                    className="bg-[#05080f] border border-white/[0.12] focus:border-cyan-400 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="OFF">Manual Only (Off)</option>
                    <option value="HOURLY">Hourly Snapshots</option>
                    <option value="EVERY_6_HOURS">Every 6 Hours (Recommended)</option>
                    <option value="DAILY">Daily at 00:00 UTC</option>
                    <option value="WEEKLY">Weekly Full Backup</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalSettings.backup.includeAgentMemories}
                      onChange={(e) => updateBackupSettings({ includeAgentMemories: e.target.checked })}
                      className="accent-cyan-400"
                    />
                    <span className="text-slate-300 text-[11px]">Include Neural Memories</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalSettings.backup.includeArtifactFiles}
                      onChange={(e) => updateBackupSettings({ includeArtifactFiles: e.target.checked })}
                      className="accent-cyan-400"
                    />
                    <span className="text-slate-300 text-[11px]">Include Content Index</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalSettings.backup.encryptBackups}
                      onChange={(e) => updateBackupSettings({ encryptBackups: e.target.checked })}
                      className="accent-cyan-400"
                    />
                    <span className="text-slate-300 text-[11px]">AES-256 Encryption</span>
                  </label>
                </div>
              </div>

              {/* Danger Zone: Factory Reset */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>DANGER ZONE: FACTORY RESET</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Purges local tasks, fleets, agent changes, and resets to pristine out-of-the-box defaults.
                  </p>
                </div>

                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-semibold transition-all cursor-pointer"
                  >
                    Reset Cluster State
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        resetClusterToDefaults();
                        setShowResetConfirm(false);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                      Confirm Wipe & Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Changes are persisted automatically to host state repository.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-mono text-xs font-semibold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
