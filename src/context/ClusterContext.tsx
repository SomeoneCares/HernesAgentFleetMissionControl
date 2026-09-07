import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  Agent, 
  TaskItem, 
  ActivityEvent, 
  AgentMemoryItem, 
  ModelOption, 
  Fleet, 
  UserProfile, 
  FleetRoutingConfig, 
  FleetRoutingRule, 
  FleetHandoffRule, 
  ArtifactItem,
  PortalSettings,
  PortalConnectionSettings,
  PortalStorageSettings,
  PortalPreferenceSettings,
  PortalBackupSettings,
  PortalBrandingSettings
} from '../types';
import { INITIAL_AGENTS, INITIAL_TASKS, INITIAL_ACTIVITY_EVENTS, AVAILABLE_MODELS, INITIAL_FLEETS, INITIAL_FLEET_ROUTING_CONFIG, INITIAL_ARTIFACTS } from '../data/mockData';
import { testHermesConnection, fetchHermesModels, fetchHermesProfilesAndFleets, DiscoveredHermesProfile, DiscoveredHermesFleet } from '../services/hermesAgentService';

export const createLiveHermesFleet = (
  name = 'Hermes Agent Swarm',
  codename = 'FLEET-HERMES-LIVE',
  modelId = 'hermes-agent',
  purpose: Fleet['purpose'] = 'Core Production'
): Fleet => ({
  id: 'fleet-hermes-live',
  name,
  codename,
  description: 'Connected directly to live Hermes agent daemon. Real execution runtime with zero mockups.',
  purpose,
  status: 'ACTIVE',
  nodeCluster: 'local.hermes.daemon',
  vramAllocated: 'Dynamic Host Allocation',
  defaultModelId: modelId,
  color: '#00f2fe',
  isLiveHermesProfile: true,
  isMockup: false
});

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  connection: {
    serverUrl: 'http://localhost:8642',
    protocol: 'HTTP_REST',
    authToken: '',
    verifyTls: true,
    connectionStatus: 'CONNECTED',
    clusterRegion: 'LOCAL-HERMES-GATEWAY',
    heartbeatIntervalSec: 5,
    lastHeartbeatPingMs: 12,
    isLiveMode: false,
    mockDataPurged: false,
    connectedAgentModel: 'hermes-agent'
  },
  storage: {
    libraryFolderPath: '/var/lib/hermes/swarm-artifacts',
    ipfsGatewayUrl: 'https://ipfs.io/ipfs/',
    s3BucketEndpoint: 's3://hermes-cluster-vault/production/',
    storageQuotaGb: 50,
    autoPurgeDays: 30,
    compressOnIngest: true,
    vectorIndexMemoryMb: 2048
  },
  branding: {
    portalName: 'HERMES',
    portalTagline: 'AUTONOMOUS MISSION CONTROL',
    organizationName: 'SOVEREIGN AGENT CLUSTER',
    versionBadge: 'OS 4.2',
    logoIcon: 'Layers',
    customLogoUrl: '',
    accentColor: '#4cd7f6',
    footerDisclaimer: 'HERMES PROTOCOL // AUTONOMOUS AGENT ORCHESTRATION',
    showOrgBadge: true
  },
  preferences: {
    defaultFleetId: 'fleet-alpha-core',
    defaultLandingTab: 'overview',
    telemetryLogRetention: 1000,
    soundAlertsEnabled: false,
    autoRebalanceSatThreshold: 90,
    refreshIntervalSec: 3
  },
  backup: {
    autoBackupSchedule: 'EVERY_6_HOURS',
    lastBackupTimestamp: '2026-09-05 14:30:00 UTC',
    backupTargetLocation: 'LOCAL_DOWNLOAD',
    includeAgentMemories: true,
    includeArtifactFiles: true,
    encryptBackups: true
  }
};

export const DEFAULT_OPERATOR_PROFILE: UserProfile = {
  callsign: 'OP-7740',
  name: 'Basem Alsaeed',
  role: 'Master Cluster Architect',
  authLevel: 'LEVEL-4 AUTH',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Primary Overseer directing multi-fleet autonomous agent orchestration, VRAM allocation, and neural comms.',
  email: 'basemAlsaeed@gmail.com'
};

interface ClusterContextType {
  tasks: TaskItem[];
  agents: Agent[];
  events: ActivityEvent[];
  fleets: Fleet[];
  artifacts: ArtifactItem[];
  routingConfig: FleetRoutingConfig;
  portalSettings: PortalSettings;
  activeFleetId: string;
  activeFleet: Fleet | null;
  activeAgents: Agent[];
  activeTasks: TaskItem[];
  operatorProfile: UserProfile;
  toast: string | null;
  availableModels: ModelOption[];
  refreshHermesModels: () => Promise<string[]>;
  setActiveFleetId: (fleetId: string) => void;
  createFleet: (newFleet: Fleet) => void;
  deleteFleet: (fleetId: string) => void;
  registerHermesProfileAndFleet: (params: {
    name: string;
    codename?: string;
    description?: string;
    modelId?: string;
    role?: string;
    soulPrompt?: string;
    tools?: string[];
    purpose?: Fleet['purpose'];
    purgeMockups?: boolean;
  }) => { newFleet: Fleet; newAgent: Agent };
  syncHermesProfilesAndFleets: () => Promise<{
    success: boolean;
    discoveredProfilesCount: number;
    discoveredFleetsCount: number;
    message: string;
  }>;
  moveTask: (taskId: string, targetColumn: 'todo' | 'inprogress' | 'done') => void;
  createTask: (newTask: TaskItem) => void;
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  setEvents: React.Dispatch<React.SetStateAction<ActivityEvent[]>>;
  setFleets: React.Dispatch<React.SetStateAction<Fleet[]>>;
  setArtifacts: React.Dispatch<React.SetStateAction<ArtifactItem[]>>;
  addArtifact: (artifact: ArtifactItem) => void;
  updateRoutingConfig: (updates: Partial<FleetRoutingConfig>) => void;
  addRoutingRule: (rule: FleetRoutingRule) => void;
  updateRoutingRule: (ruleId: string, updates: Partial<FleetRoutingRule>) => void;
  deleteRoutingRule: (ruleId: string) => void;
  addHandoffRule: (rule: FleetHandoffRule) => void;
  updateHandoffRule: (ruleId: string, updates: Partial<FleetHandoffRule>) => void;
  deleteHandoffRule: (ruleId: string) => void;
  updatePortalSettings: (updates: Partial<PortalSettings>) => void;
  updateConnectionSettings: (updates: Partial<PortalConnectionSettings>) => void;
  updateStorageSettings: (updates: Partial<PortalStorageSettings>) => void;
  updateBrandingSettings: (updates: Partial<PortalBrandingSettings>) => void;
  updatePreferenceSettings: (updates: Partial<PortalPreferenceSettings>) => void;
  updateBackupSettings: (updates: Partial<PortalBackupSettings>) => void;
  exportClusterSnapshot: () => string;
  importClusterSnapshot: (jsonString: string) => boolean;
  resetClusterToDefaults: () => void;
  testConnectionPing: () => Promise<number>;
  purgeMockData: () => void;
  restoreMockData: () => void;
  syncWithRealHermesAgent: (force?: boolean) => Promise<boolean>;
  updateAgentSoul: (agentId: string, newSoul: string) => void;
  updateAgentMemories: (agentId: string, memories: AgentMemoryItem[]) => void;
  changeAgentModel: (agentId: string, newModelId: string) => void;
  autoBalanceFleet: () => void;
  killAgentTask: (agentId: string) => void;
  deployAgent: (newAgent: Agent) => void;
  reassignAgentFleet: (agentId: string, newFleetId: string) => void;
  updateAgentPhoto: (agentId: string, photoUrl: string) => void;
  updateOperatorProfile: (updates: Partial<UserProfile>) => void;
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  showToast: (msg: string) => void;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

const TASKS_STORAGE_KEY = 'hermes_tasks_state_v1';
const AGENTS_STORAGE_KEY = 'hermes_agents_state_v1';
const FLEETS_STORAGE_KEY = 'hermes_fleets_state_v1';
const ACTIVE_FLEET_KEY = 'hermes_active_fleet_id';
const PORTAL_SETTINGS_KEY = 'hermes_portal_settings_v1';
const MOCK_PURGED_KEY = 'hermes_mock_purged_v1';

export const ClusterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize portal settings
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(() => {
    try {
      const saved = localStorage.getItem(PORTAL_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let serverUrl = parsed.connection?.serverUrl || DEFAULT_PORTAL_SETTINGS.connection.serverUrl;
        // Migrate legacy 8080 default to standard Hermes Agent gateway port 8642
        if (serverUrl === 'http://localhost:8080' || serverUrl === 'http://127.0.0.1:8080') {
          serverUrl = 'http://localhost:8642';
        }
        return {
          connection: { ...DEFAULT_PORTAL_SETTINGS.connection, ...parsed.connection, serverUrl },
          storage: { ...DEFAULT_PORTAL_SETTINGS.storage, ...parsed.storage },
          branding: { ...DEFAULT_PORTAL_SETTINGS.branding, ...parsed.branding },
          preferences: { ...DEFAULT_PORTAL_SETTINGS.preferences, ...parsed.preferences },
          backup: { ...DEFAULT_PORTAL_SETTINGS.backup, ...parsed.backup }
        };
      }
    } catch (e) {
      console.error('Failed to load portalSettings from localStorage', e);
    }
    return DEFAULT_PORTAL_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(portalSettings));
    } catch (e) {
      console.error('Failed to save portalSettings', e);
    }
  }, [portalSettings]);

  // Initialize fleets
  const [fleets, setFleets] = useState<Fleet[]>(() => {
    try {
      const isMockPurged = localStorage.getItem(MOCK_PURGED_KEY) === 'true';
      const saved = localStorage.getItem(FLEETS_STORAGE_KEY);
      if (saved) {
        const parsed: Fleet[] = JSON.parse(saved);
        if (isMockPurged) {
          const liveOnly = parsed.filter(f => !f.isMockup && f.id !== 'fleet-alpha-core' && f.id !== 'fleet-dev-synth' && f.id !== 'fleet-deep-oracle' && f.id !== 'fleet-sec-sentinel');
          if (liveOnly.length > 0) return liveOnly;
          return [createLiveHermesFleet()];
        }
        return parsed;
      }
      if (isMockPurged) {
        return [createLiveHermesFleet()];
      }
    } catch (e) {
      console.error('Failed to load fleets from localStorage', e);
    }
    return INITIAL_FLEETS;
  });

  // Initialize active fleet id
  const [activeFleetId, setActiveFleetIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_FLEET_KEY);
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load activeFleetId', e);
    }
    return 'all';
  });

  const setActiveFleetId = (id: string) => {
    setActiveFleetIdState(id);
    try {
      localStorage.setItem(ACTIVE_FLEET_KEY, id);
    } catch (e) {
      console.error('Failed to save activeFleetId', e);
    }
    const targetFleet = fleets.find(f => f.id === id);
    if (targetFleet) {
      showToast(`Switched active fleet context to [${targetFleet.codename}]`);
    } else if (id === 'all') {
      showToast(`Switched to Federated View (All Host Fleets)`);
    }
  };

  // Sync fleets
  useEffect(() => {
    try {
      localStorage.setItem(FLEETS_STORAGE_KEY, JSON.stringify(fleets));
    } catch (e) {
      console.error('Failed to persist fleets', e);
    }
  }, [fleets]);

  // Helper to resolve fleetId for legacy stored agents
  const resolveLegacyAgentFleet = (agent: Agent): string => {
    if (agent.fleetId) return agent.fleetId;
    if (agent.id.includes('synth') || agent.id.includes('coder') || agent.id.includes('vanguard')) return 'fleet-dev-synth';
    if (agent.id.includes('oracle') || agent.id.includes('research') || agent.id.includes('citation')) return 'fleet-deep-oracle';
    if (agent.id.includes('security') || agent.id.includes('guard') || agent.id.includes('sentinel')) return 'fleet-sec-sentinel';
    return 'fleet-alpha-core';
  };

  // Initialize tasks from localStorage or mockData
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      if (localStorage.getItem(MOCK_PURGED_KEY) === 'true') {
        const saved = localStorage.getItem(TASKS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        return [];
      }
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const parsed: TaskItem[] = JSON.parse(saved);
        return parsed.map(t => ({
          ...t,
          fleetId: t.fleetId || (t.assignedAgent.toLowerCase().includes('dev') ? 'fleet-dev-synth' : 'fleet-alpha-core')
        }));
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return localStorage.getItem(MOCK_PURGED_KEY) === 'true' ? [] : INITIAL_TASKS;
  });

  // Helper to create live connected Hermes Agent instance
  const createLiveHermesAgent = (
    modelName = 'hermes-agent',
    ping = 12,
    skills?: string[],
    toolsets?: string[],
    customFleetId?: string
  ): Agent => ({
    id: 'hermes-live-gateway',
    name: 'Hermes Agent',
    codename: 'Gateway-01 // Live',
    role: `Autonomous Gateway Core. Connected directly to ${portalSettings.connection.serverUrl} daemon with real model inference.`,
    fleetId: customFleetId || (fleets[0]?.id || 'fleet-hermes-live'),
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'psychology',
    avatarPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    description: `Live Hermes Agent instance connected to ${portalSettings.connection.serverUrl}. Zero mockup data.`,
    activeModelId: modelName,
    latencyLabel: `${ping}ms • LOCAL GATEWAY`,
    contextUsed: 1024,
    contextTotal: 128000,
    uptime: 'Live Session',
    slasHealth: '100% Verified Socket',
    memoryArchitecture: toolsets && toolsets.length > 0 ? toolsets : ['Live Context', 'Tool Execution', 'Real Reasoning'],
    assignedTasks: [],
    tools: skills && skills.length > 0 ? skills : ['bash_sandbox', 'file_editor', 'web_search', 'python_eval'],
    allocationPercent: 100,
    soulPrompt: `Autonomous Hermes Agent running on ${portalSettings.connection.serverUrl}. Zero mockup data.`,
    isLiveHermesProfile: true,
    isMockup: false
  });

  // Initialize agents from localStorage or mockData
  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
      if (localStorage.getItem(MOCK_PURGED_KEY) === 'true') {
        const saved = localStorage.getItem(AGENTS_STORAGE_KEY);
        if (saved) {
          const parsed: Agent[] = JSON.parse(saved);
          const liveOnly = parsed.filter(a => !a.isMockup && a.id !== 'hermes-prime' && a.id !== 'code-synthesizer' && a.id !== 'test-vanguard' && a.id !== 'research-oracle' && a.id !== 'citation-auditor' && a.id !== 'ops-sentry' && a.id !== 'data-weaver' && a.id !== 'security-sentinel');
          if (liveOnly.length > 0) return liveOnly;
        }
        return [createLiveHermesAgent()];
      }
      const saved = localStorage.getItem(AGENTS_STORAGE_KEY);
      if (saved) {
        const parsed: Agent[] = JSON.parse(saved);
        // Ensure every agent has fleetId and new default agents exist if missing
        const existingIds = new Set(parsed.map(a => a.id));
        const updated: Agent[] = parsed.map(a => {
          const initMatch = INITIAL_AGENTS.find(i => i.id === a.id);
          return {
            ...a,
            fleetId: resolveLegacyAgentFleet(a),
            avatarPhoto: a.avatarPhoto || initMatch?.avatarPhoto
          };
        });
        INITIAL_AGENTS.forEach(initAgent => {
          if (!existingIds.has(initAgent.id)) {
            updated.push(initAgent);
          }
        });
        return updated;
      }
    } catch (e) {
      console.error('Failed to load agents from localStorage', e);
    }
    return localStorage.getItem(MOCK_PURGED_KEY) === 'true' ? [createLiveHermesAgent()] : INITIAL_AGENTS;
  });

  const [events, setEvents] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_EVENTS);
  const [toast, setToast] = useState<string | null>(null);

  // Sync tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  }, [tasks]);

  // Sync agents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
    } catch (e) {
      console.error('Failed to persist agents', e);
    }
  }, [agents]);

  const activeFleet = useMemo(() => {
    return fleets.find(f => f.id === activeFleetId) || null;
  }, [fleets, activeFleetId]);

  // Filtered agents for active fleet
  const activeAgents = useMemo(() => {
    if (activeFleetId === 'all') return agents;
    return agents.filter(a => (a.fleetId || 'fleet-alpha-core') === activeFleetId);
  }, [agents, activeFleetId]);

  // Filtered tasks for active fleet
  const activeTasks = useMemo(() => {
    if (activeFleetId === 'all') return tasks;
    return tasks.filter(t => (t.fleetId || 'fleet-alpha-core') === activeFleetId);
  }, [tasks, activeFleetId]);

  const createFleet = (newFleet: Fleet) => {
    setFleets(prev => [...prev, newFleet]);
    setActiveFleetId(newFleet.id);

    // If no agent belongs to this fleet yet, create an agent profile for this fleet so it appears in Chat and Agents list
    setAgents(prev => {
      const hasAgent = prev.some(a => a.fleetId === newFleet.id);
      if (!hasAgent) {
        const fleetAgent: Agent = {
          id: `agent-${newFleet.id}`,
          name: newFleet.name,
          codename: `${newFleet.codename} // Fleet Core`,
          role: `Autonomous Agent profile commanding fleet ${newFleet.name}.`,
          fleetId: newFleet.id,
          status: 'ONLINE',
          statusColor: 'tertiary',
          avatarIcon: 'psychology',
          avatarPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
          description: newFleet.description || `Autonomous agent profile for ${newFleet.name}.`,
          activeModelId: newFleet.defaultModelId || portalSettings.connection.connectedAgentModel || 'hermes-agent',
          latencyLabel: `${portalSettings.connection.lastHeartbeatPingMs || 12}ms • HERMES LIVE`,
          contextUsed: 1024,
          contextTotal: 128000,
          uptime: 'Live',
          slasHealth: '100% Operational',
          memoryArchitecture: ['Session Directives', 'Hermes Toolsets'],
          assignedTasks: [],
          tools: ['bash_sandbox', 'file_editor', 'web_search'],
          allocationPercent: 100,
          soulPrompt: `You are the autonomous agent profile for fleet ${newFleet.name} (${newFleet.codename}).`,
          isLiveHermesProfile: true,
          profileName: newFleet.name,
          isMockup: false
        };
        return [...prev, fleetAgent];
      }
      return prev;
    });

    showToast(`Created & booted fleet [${newFleet.codename}] on host cluster.`);
    addActivityEvent({
      agent: 'Hermes Orchestrator',
      category: 'GATEWAY',
      text: `Host server partitioned new fleet: ${newFleet.name} [${newFleet.codename}]`,
      status: 'PROVISIONED',
      statusType: 'success'
    });
  };

  const deleteFleet = (fleetId: string) => {
    setFleets(prev => {
      const remaining = prev.filter(f => f.id !== fleetId);
      if (remaining.length === 0) {
        return [createLiveHermesFleet()];
      }
      return remaining;
    });

    if (activeFleetId === fleetId) {
      const remaining = fleets.filter(f => f.id !== fleetId);
      setActiveFleetId(remaining[0]?.id || 'all');
    }

    showToast(`Removed fleet partition [${fleetId}]`);
    addActivityEvent({
      agent: 'Hermes Orchestrator',
      category: 'GATEWAY',
      text: `Removed fleet partition: ${fleetId}`,
      status: 'DECOMMISSIONED',
      statusType: 'warning'
    });
  };

  const registerHermesProfileAndFleet = (params: {
    name: string;
    codename?: string;
    description?: string;
    modelId?: string;
    role?: string;
    soulPrompt?: string;
    tools?: string[];
    purpose?: Fleet['purpose'];
    purgeMockups?: boolean;
  }): { newFleet: Fleet; newAgent: Agent } => {
    const rawName = params.name.trim();
    const cleanSlug = rawName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'hermes-profile';
    const fleetId = `fleet-${cleanSlug}-${Date.now().toString(36).slice(-4)}`;
    const agentId = `agent-${cleanSlug}-${Date.now().toString(36).slice(-4)}`;
    const codename = params.codename?.trim() || `FLEET-${cleanSlug.toUpperCase()}`;
    const model = params.modelId || portalSettings.connection.connectedAgentModel || 'hermes-agent';

    const newFleet: Fleet = {
      id: fleetId,
      name: rawName,
      codename,
      description: params.description || `Autonomous Hermes Agent Profile [${rawName}] connected on local daemon.`,
      purpose: params.purpose || 'Core Production',
      status: 'ACTIVE',
      nodeCluster: 'local.hermes.daemon',
      vramAllocated: 'Dynamic Profile VRAM',
      defaultModelId: model,
      color: '#00f2fe',
      isLiveHermesProfile: true,
      profileName: rawName,
      serverUrl: portalSettings.connection.serverUrl,
      isMockup: false
    };

    const newAgent: Agent = {
      id: agentId,
      name: rawName,
      codename: `${codename} // Profile`,
      role: params.role || `Autonomous Hermes Agent Profile (${rawName}) running model ${model}.`,
      fleetId: newFleet.id,
      status: 'ONLINE',
      statusColor: 'tertiary',
      avatarIcon: 'psychology',
      avatarPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      description: params.description || `Live Hermes Agent Profile [${rawName}]. Zero mockup data.`,
      activeModelId: model,
      latencyLabel: `${portalSettings.connection.lastHeartbeatPingMs || 12}ms • HERMES LIVE`,
      contextUsed: 1024,
      contextTotal: 128000,
      uptime: 'Active Session',
      slasHealth: '100% Operational',
      memoryArchitecture: ['Session Context', 'SOUL Directives', 'Hermes Tooling'],
      assignedTasks: [],
      tools: params.tools && params.tools.length > 0 ? params.tools : ['bash_sandbox', 'file_editor', 'web_search'],
      allocationPercent: 100,
      soulPrompt: params.soulPrompt || `You are ${rawName}, an autonomous AI agent running on Hermes Agent daemon.`,
      isLiveHermesProfile: true,
      profileName: rawName,
      isMockup: false
    };

    const shouldPurge = params.purgeMockups ?? true;

    if (shouldPurge) {
      setFleets(prev => {
        const liveOnly = prev.filter(f => !f.isMockup && f.id !== 'fleet-alpha-core' && f.id !== 'fleet-dev-synth' && f.id !== 'fleet-deep-oracle' && f.id !== 'fleet-sec-sentinel');
        return [newFleet, ...liveOnly.filter(f => f.id !== newFleet.id)];
      });
      setAgents(prev => {
        const liveOnly = prev.filter(a => !a.isMockup && !a.id.startsWith('agent-0') && a.id !== 'hermes-prime' && a.id !== 'code-synthesizer' && a.id !== 'test-vanguard' && a.id !== 'research-oracle' && a.id !== 'citation-auditor' && a.id !== 'ops-sentry' && a.id !== 'data-weaver' && a.id !== 'security-sentinel');
        return [newAgent, ...liveOnly.filter(a => a.id !== newAgent.id)];
      });
      setPortalSettings(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          isLiveMode: true,
          mockDataPurged: true,
          connectionStatus: 'CONNECTED'
        }
      }));
      try {
        localStorage.setItem(MOCK_PURGED_KEY, 'true');
      } catch {}
    } else {
      setFleets(prev => [...prev.filter(f => f.id !== newFleet.id), newFleet]);
      setAgents(prev => [...prev.filter(a => a.id !== newAgent.id), newAgent]);
    }

    setActiveFleetId(newFleet.id);

    showToast(`Registered Hermes Profile [${rawName}]! Active in Fleets and Chat.`);
    addActivityEvent({
      agent: rawName,
      category: 'AGENT',
      text: `Connected Hermes agent profile: ${rawName} [${codename}]`,
      status: 'CONNECTED',
      statusType: 'success'
    });

    return { newFleet, newAgent };
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Move task between stages and reflect in real agent execution state
  const moveTask = (taskId: string, targetColumn: 'todo' | 'inprogress' | 'done') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === targetColumn) return;

    const previousColumn = task.column;

    // 1. Calculate updated subtasks
    let updatedSubtasksCompleted = task.subtasksCompleted;
    if (targetColumn === 'done') {
      updatedSubtasksCompleted = task.subtasksTotal;
    } else if (targetColumn === 'inprogress' && task.subtasksCompleted === 0) {
      updatedSubtasksCompleted = Math.max(1, Math.floor(task.subtasksTotal * 0.35));
    } else if (targetColumn === 'todo') {
      updatedSubtasksCompleted = 0;
    }

    const updatedTask: TaskItem = {
      ...task,
      column: targetColumn,
      subtasksCompleted: updatedSubtasksCompleted
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    // 2. Real Reflection on the Assigned Agent
    const assignedAgentQuery = task.assignedAgent.toLowerCase();
    const assignedTag = task.agentTag.toLowerCase();

    setAgents(prevAgents => prevAgents.map(ag => {
      const isTargetAgent = 
        ag.name.toLowerCase().includes(assignedAgentQuery) ||
        assignedAgentQuery.includes(ag.name.toLowerCase()) ||
        ag.codename.toLowerCase().includes(assignedTag);

      if (!isTargetAgent) return ag;

      if (targetColumn === 'inprogress') {
        const progressPct = Math.max(25, Math.round((updatedSubtasksCompleted / (task.subtasksTotal || 1)) * 100));
        return {
          ...ag,
          status: 'BUSY',
          activeTask: {
            title: task.title,
            pid: task.hash.replace('#', ''),
            fileOrSource: task.tags?.[0] ? `Context: ${task.tags[0]}` : 'Active Dispatch Pipeline',
            progress: progressPct
          },
          assignedTasks: [
            { id: `#${task.hash}`, title: task.title, active: true },
            ...ag.assignedTasks.filter(t => !t.title.includes(task.title))
          ]
        };
      } else if (targetColumn === 'done') {
        const wasActiveOnThisAgent = 
          ag.activeTask?.title === task.title || 
          ag.activeTask?.pid === task.hash.replace('#', '');

        return {
          ...ag,
          status: wasActiveOnThisAgent ? 'ONLINE' : ag.status,
          activeTask: wasActiveOnThisAgent ? undefined : ag.activeTask,
          assignedTasks: ag.assignedTasks.map(t => 
            t.title.includes(task.title) ? { ...t, active: false } : t
          )
        };
      } else if (targetColumn === 'todo') {
        const wasActiveOnThisAgent = 
          ag.activeTask?.title === task.title || 
          ag.activeTask?.pid === task.hash.replace('#', '');

        return {
          ...ag,
          status: wasActiveOnThisAgent ? 'ONLINE' : ag.status,
          activeTask: wasActiveOnThisAgent ? undefined : ag.activeTask,
          assignedTasks: ag.assignedTasks.map(t => 
            t.title.includes(task.title) ? { ...t, active: false } : t
          )
        };
      }
      return ag;
    }));

    // 3. Activity Ledger Log
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    let logText = '';
    let logStatus = '';
    let logType: 'success' | 'info' | 'saved' | 'warning' = 'info';

    if (targetColumn === 'inprogress') {
      logText = `Task [${task.hash}] "${task.title}" moved to IN PROGRESS. Dispatched to ${task.assignedAgent}.`;
      logStatus = 'DISPATCHED';
      logType = 'info';
    } else if (targetColumn === 'done') {
      logText = `Task [${task.hash}] "${task.title}" verified & complete. SLA closed by ${task.assignedAgent}.`;
      logStatus = 'COMPLETED';
      logType = 'success';
    } else {
      logText = `Task [${task.hash}] "${task.title}" re-queued to TO DO backlog.`;
      logStatus = 'QUEUED';
      logType = 'warning';
    }

    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      agent: task.assignedAgent,
      category: 'AGENT',
      text: logText,
      status: logStatus,
      statusType: logType,
      duration: targetColumn === 'done' ? '4m 18s' : undefined
    };

    setEvents(prev => [newEvent, ...prev]);

    // 4. Toast announcement
    if (targetColumn === 'inprogress') {
      showToast(`Moved #${task.hash} to IN PROGRESS • ${task.assignedAgent} status set to BUSY`);
    } else if (targetColumn === 'done') {
      showToast(`Task #${task.hash} marked DONE • ${task.assignedAgent} headroom restored`);
    } else {
      showToast(`Returned #${task.hash} to TO DO backlog queue`);
    }
  };

  const createTask = (newTask: TaskItem) => {
    setTasks(prev => [newTask, ...prev]);
    showToast(`Created new mission #${newTask.hash} assigned to ${newTask.assignedAgent}`);
  };

  const updateAgentSoul = (agentId: string, newSoul: string) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, soulPrompt: newSoul } : ag));
    showToast(`Saved and hot-reloaded soul.md for ${agentId}`);
  };

  const updateAgentMemories = (agentId: string, memories: AgentMemoryItem[]) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, memories } : ag));
    showToast(`Updated neural memory repository for ${agentId} (${memories.length} records)`);
  };

  // Dynamic Model List: Combines live models reported by Hermes with spec metadata
  const availableModels: ModelOption[] = useMemo(() => {
    const isLive = Boolean(portalSettings.connection.isLiveMode || portalSettings.connection.mockDataPurged);
    const liveIds = portalSettings.connection.availableModels || [];
    const connectedPrimary = portalSettings.connection.connectedAgentModel;

    // Collect all unique model IDs reported by Hermes daemon
    const distinctLiveIds = new Set<string>();
    if (connectedPrimary) distinctLiveIds.add(connectedPrimary);
    liveIds.forEach(id => {
      if (id && typeof id === 'string') distinctLiveIds.add(id.trim());
    });
    if (isLive && distinctLiveIds.size === 0) {
      distinctLiveIds.add('hermes-agent');
    }

    const liveModelOptions: ModelOption[] = Array.from(distinctLiveIds).map(id => {
      const existing = AVAILABLE_MODELS.find(m => m.id === id || m.name.toLowerCase().includes(id.toLowerCase()));
      if (existing) {
        return {
          ...existing,
          id,
          name: `${existing.name} [Live Gateway]`,
          tag: 'LIVE GATEWAY',
          latencyMs: portalSettings.connection.lastHeartbeatPingMs || existing.latencyMs
        };
      }
      return {
        id,
        name: id === 'hermes-agent' ? 'Hermes Agent (Live Gateway Core)' : `${id} (Live Gateway)`,
        provider: 'Connected Hermes Gateway',
        latencyMs: portalSettings.connection.lastHeartbeatPingMs || 8,
        throughputTps: 85.0,
        costPerM: 0.00,
        contextWindow: '128k',
        tag: 'LIVE GATEWAY'
      };
    });

    if (isLive && portalSettings.connection.mockDataPurged) {
      // User purged mockup demo data: Strictly display real live models from the connected daemon!
      return liveModelOptions.length > 0 ? liveModelOptions : [
        {
          id: 'hermes-agent',
          name: 'Hermes Agent (Live Gateway / Port 8642)',
          provider: 'Connected Hermes Gateway',
          latencyMs: 8,
          throughputTps: 85.0,
          costPerM: 0.00,
          contextWindow: '128k',
          tag: 'LIVE GATEWAY'
        }
      ];
    }

    // Hybrid/Demo mode: Live models first, then demo catalog models
    const existingIds = new Set(liveModelOptions.map(m => m.id));
    const nonDuplicatedDemo = AVAILABLE_MODELS.filter(m => !existingIds.has(m.id));
    return [...liveModelOptions, ...nonDuplicatedDemo];
  }, [
    portalSettings.connection.isLiveMode,
    portalSettings.connection.mockDataPurged,
    portalSettings.connection.availableModels,
    portalSettings.connection.connectedAgentModel,
    portalSettings.connection.lastHeartbeatPingMs
  ]);

  const changeAgentModel = (agentId: string, newModelId: string) => {
    const modelObj = availableModels.find(m => m.id === newModelId) || AVAILABLE_MODELS.find(m => m.id === newModelId);
    
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          activeModelId: newModelId,
          latencyLabel: modelObj ? `${modelObj.latencyMs}ms • ${modelObj.tag}` : '8ms • LOCAL GATEWAY'
        };
      }
      return ag;
    }));

    const modelName = modelObj ? modelObj.name : newModelId;
    showToast(`Updated ${agentId} to ${modelName}`);
  };

  const autoBalanceFleet = () => {
    setAgents(prev => {
      const total = prev.length;
      const avg = Math.floor(100 / total);
      return prev.map((ag, idx) => ({
        ...ag,
        allocationPercent: idx === 0 ? 100 - (avg * (total - 1)) : avg
      }));
    });
    showToast('Fleet workload auto-balanced across available GPU tensor cores');
  };

  const killAgentTask = (agentId: string) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          status: 'ONLINE',
          activeTask: undefined,
          assignedTasks: ag.assignedTasks.filter(t => !t.active)
        };
      }
      return ag;
    }));
    showToast(`Halted active task on ${agentId}. Headroom restored.`);
  };

  const deployAgent = (newAgent: Agent) => {
    setAgents(prev => [newAgent, ...prev]);
    showToast(`Successfully deployed autonomous worker: ${newAgent.name}`);
  };

  const reassignAgentFleet = (agentId: string, newFleetId: string) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, fleetId: newFleetId } : ag));
    const targetFleet = fleets.find(f => f.id === newFleetId);
    showToast(`Reassigned agent to [${targetFleet?.codename || newFleetId}] partition`);
  };

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEvent: ActivityEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      timestamp: timeStr
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const [operatorProfile, setOperatorProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('hermes_operator_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_OPERATOR_PROFILE,
          ...parsed,
          photoUrl: parsed.photoUrl || DEFAULT_OPERATOR_PROFILE.photoUrl
        };
      }
    } catch (e) {
      console.error('Failed to load operator profile', e);
    }
    return DEFAULT_OPERATOR_PROFILE;
  });

  // Fleet Routing & Handoff Configuration state
  const [routingConfig, setRoutingConfig] = useState<FleetRoutingConfig>(() => {
    try {
      const saved = localStorage.getItem('hermes_fleet_routing_config_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load routing config', e);
    }
    return INITIAL_FLEET_ROUTING_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hermes_fleet_routing_config_v1', JSON.stringify(routingConfig));
    } catch (e) {
      console.error('Failed to persist routing config', e);
    }
  }, [routingConfig]);

  // Content Library Artifacts state
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>(() => {
    try {
      const saved = localStorage.getItem('hermes_artifacts_state_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load artifacts', e);
    }
    return INITIAL_ARTIFACTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hermes_artifacts_state_v1', JSON.stringify(artifacts));
    } catch (e) {
      console.error('Failed to persist artifacts', e);
    }
  }, [artifacts]);

  const addArtifact = (newArt: ArtifactItem) => {
    setArtifacts(prev => [newArt, ...prev]);
    showToast(`Artifact "${newArt.name}" ingested into Content Library`);
  };

  const updateRoutingConfig = (updates: Partial<FleetRoutingConfig>) => {
    setRoutingConfig(prev => ({ ...prev, ...updates }));
    showToast('Fleet routing parameters updated');
  };

  const addRoutingRule = (rule: FleetRoutingRule) => {
    setRoutingConfig(prev => ({
      ...prev,
      routingRules: [...prev.routingRules, rule]
    }));
    showToast(`Routing rule "${rule.name}" activated`);
  };

  const updateRoutingRule = (ruleId: string, updates: Partial<FleetRoutingRule>) => {
    setRoutingConfig(prev => ({
      ...prev,
      routingRules: prev.routingRules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    }));
    showToast('Routing rule updated');
  };

  const deleteRoutingRule = (ruleId: string) => {
    setRoutingConfig(prev => ({
      ...prev,
      routingRules: prev.routingRules.filter(r => r.id !== ruleId)
    }));
    showToast('Routing rule purged');
  };

  const addHandoffRule = (rule: FleetHandoffRule) => {
    setRoutingConfig(prev => ({
      ...prev,
      handoffRules: [...prev.handoffRules, rule]
    }));
    showToast(`Handoff rule "${rule.name}" activated`);
  };

  const updateHandoffRule = (ruleId: string, updates: Partial<FleetHandoffRule>) => {
    setRoutingConfig(prev => ({
      ...prev,
      handoffRules: prev.handoffRules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    }));
    showToast('Handoff rule updated');
  };

  const deleteHandoffRule = (ruleId: string) => {
    setRoutingConfig(prev => ({
      ...prev,
      handoffRules: prev.handoffRules.filter(r => r.id !== ruleId)
    }));
    showToast('Handoff rule purged');
  };

  const updateOperatorProfile = (updates: Partial<UserProfile>) => {
    setOperatorProfile(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('hermes_operator_profile_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist operator profile', e);
      }
      return updated;
    });
    showToast('Operator profile updated successfully');
  };

  const updateAgentPhoto = (agentId: string, photoUrl: string) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, avatarPhoto: photoUrl } : ag));
    showToast('Updated agent portrait photo');
  };

  const updatePortalSettings = (updates: Partial<PortalSettings>) => {
    setPortalSettings(prev => ({
      ...prev,
      ...updates
    }));
    showToast('Portal configuration updated');
  };

  const updateConnectionSettings = (updates: Partial<PortalConnectionSettings>) => {
    setPortalSettings(prev => ({
      ...prev,
      connection: { ...prev.connection, ...updates }
    }));
    showToast('Hermes daemon connection updated');
  };

  const updateStorageSettings = (updates: Partial<PortalStorageSettings>) => {
    setPortalSettings(prev => ({
      ...prev,
      storage: { ...prev.storage, ...updates }
    }));
    showToast('Content library path & storage quota saved');
  };

  const updateBrandingSettings = (updates: Partial<PortalBrandingSettings>) => {
    setPortalSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, ...updates }
    }));
    showToast('Portal branding & identity updated');
  };

  const updatePreferenceSettings = (updates: Partial<PortalPreferenceSettings>) => {
    setPortalSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }));
    showToast('Default swarm preferences updated');
  };

  const updateBackupSettings = (updates: Partial<PortalBackupSettings>) => {
    setPortalSettings(prev => ({
      ...prev,
      backup: { ...prev.backup, ...updates }
    }));
    showToast('Snapshot backup schedule updated');
  };

  const testConnectionPing = async (): Promise<number> => {
    try {
      const res = await testHermesConnection(
        portalSettings.connection.serverUrl,
        portalSettings.connection.authToken
      );

      const latency = res.latencyMs || 12;
      const connectedModel = res.models?.[0] || 'hermes-agent';

      setPortalSettings(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          lastHeartbeatPingMs: latency,
          connectionStatus: res.ok ? 'CONNECTED' : 'DISCONNECTED',
          connectedAgentModel: connectedModel
        }
      }));

      if (res.ok) {
        showToast(`Hermes gateway handshake verified (${latency}ms) [Model: ${connectedModel}]`);
      } else {
        showToast(`Hermes daemon handshake notice: ${res.error || 'Check if hermes gateway is running'}`);
      }
      return latency;
    } catch {
      return 14;
    }
  };

  const purgeMockData = () => {
    // 1. Keep any custom live fleets or create a fresh live fleet
    let updatedFleets: Fleet[] = [];
    setFleets(prev => {
      const liveOnly = prev.filter(f => !f.isMockup && f.id !== 'fleet-alpha-core' && f.id !== 'fleet-dev-synth' && f.id !== 'fleet-deep-oracle' && f.id !== 'fleet-sec-sentinel');
      updatedFleets = liveOnly.length > 0 ? liveOnly : [createLiveHermesFleet()];
      return updatedFleets;
    });

    // 2. Keep any live agent profiles or create a fresh live agent attached to the live fleet
    const liveModel = portalSettings.connection.connectedAgentModel || 'hermes-agent';
    const primaryFleetId = updatedFleets[0]?.id || 'fleet-hermes-live';
    const liveAgent = createLiveHermesAgent(liveModel, portalSettings.connection.lastHeartbeatPingMs || 12, undefined, undefined, primaryFleetId);
    
    let updatedAgents: Agent[] = [];
    setAgents(prev => {
      const liveOnly = prev.filter(a => !a.isMockup && !a.id.startsWith('agent-0') && a.id !== 'hermes-prime' && a.id !== 'code-synthesizer' && a.id !== 'test-vanguard' && a.id !== 'research-oracle' && a.id !== 'citation-auditor' && a.id !== 'ops-sentry' && a.id !== 'data-weaver' && a.id !== 'security-sentinel');
      updatedAgents = liveOnly.length > 0 ? liveOnly : [liveAgent];
      return updatedAgents;
    });

    setTasks([]);
    setArtifacts([]);
    setActiveFleetId('all');

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setEvents([
      {
        id: `evt-${Date.now()}`,
        timestamp: timeStr,
        agentName: 'Hermes Agent',
        action: 'MOCK_PURGED',
        target: portalSettings.connection.serverUrl,
        status: 'SUCCESS',
        details: `Purged all simulated mockup data. Dashboard operating on live Hermes daemon (${portalSettings.connection.serverUrl}).`
      }
    ]);

    setPortalSettings(prev => ({
      ...prev,
      connection: {
        ...prev.connection,
        isLiveMode: true,
        mockDataPurged: true,
        connectionStatus: 'CONNECTED'
      }
    }));

    try {
      localStorage.setItem(MOCK_PURGED_KEY, 'true');
      localStorage.removeItem(TASKS_STORAGE_KEY);
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(updatedAgents.length > 0 ? updatedAgents : [liveAgent]));
      localStorage.setItem(FLEETS_STORAGE_KEY, JSON.stringify(updatedFleets.length > 0 ? updatedFleets : [createLiveHermesFleet()]));
    } catch (e) {
      console.error('Failed to save mock purged state', e);
    }

    showToast('Mockup data completely purged! Real Hermes Agent mode is active.');
  };

  const restoreMockData = () => {
    setFleets(INITIAL_FLEETS);
    setAgents(INITIAL_AGENTS);
    setTasks(INITIAL_TASKS);
    setArtifacts(INITIAL_ARTIFACTS);
    setEvents(INITIAL_ACTIVITY_EVENTS);
    setActiveFleetId('fleet-alpha-core');

    setPortalSettings(prev => ({
      ...prev,
      connection: {
        ...prev.connection,
        isLiveMode: false,
        mockDataPurged: false
      }
    }));

    try {
      localStorage.removeItem(MOCK_PURGED_KEY);
      localStorage.removeItem(TASKS_STORAGE_KEY);
      localStorage.removeItem(AGENTS_STORAGE_KEY);
      localStorage.removeItem(FLEETS_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear mock purged state', e);
    }

    showToast('Restored mockup demonstration cluster data');
  };

  const refreshHermesModels = async (): Promise<string[]> => {
    try {
      const models = await fetchHermesModels(
        portalSettings.connection.serverUrl,
        portalSettings.connection.authToken
      );
      if (models.length > 0) {
        setPortalSettings(prev => ({
          ...prev,
          connection: {
            ...prev.connection,
            availableModels: models,
            connectedAgentModel: models[0]
          }
        }));
        showToast(`Discovered ${models.length} model(s) from Hermes Gateway`);
        return models;
      } else {
        showToast(`No models returned from ${portalSettings.connection.serverUrl}/v1/models`);
        return [];
      }
    } catch {
      showToast(`Failed to query models from ${portalSettings.connection.serverUrl}`);
      return [];
    }
  };

  const syncHermesProfilesAndFleets = async (): Promise<{
    success: boolean;
    discoveredProfilesCount: number;
    discoveredFleetsCount: number;
    message: string;
  }> => {
    try {
      const serverUrl = portalSettings.connection.serverUrl;
      const authToken = portalSettings.connection.authToken;
      
      const res = await fetchHermesProfilesAndFleets(serverUrl, authToken);
      const pingMs = await testConnectionPing();

      if (!res.ok && res.profiles.length === 0 && res.fleets.length === 0) {
        // Also check if testHermesConnection returns models/skills
        const conn = await testHermesConnection(serverUrl, authToken);
        if (conn.ok && conn.models && conn.models.length > 0) {
          const primaryModel = conn.models[0];
          const cleanModelName = primaryModel.split('/').pop() || primaryModel;
          registerHermesProfileAndFleet({
            name: cleanModelName,
            codename: `FLEET-${cleanModelName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
            description: `Auto-synced from live Hermes gateway on ${serverUrl}`,
            modelId: primaryModel,
            purgeMockups: true
          });
          return {
            success: true,
            discoveredProfilesCount: 1,
            discoveredFleetsCount: 1,
            message: `Connected live model ${primaryModel} as active Fleet & Profile!`
          };
        }

        return {
          success: false,
          discoveredProfilesCount: 0,
          discoveredFleetsCount: 0,
          message: res.error || `No profiles/fleets returned by ${serverUrl}. You can manually register your profile with the "+ Connect Hermes Profile" button.`
        };
      }

      let pCount = 0;
      let fCount = 0;

      // Register discovered fleets
      const newFleetList: Fleet[] = [];
      res.fleets.forEach(df => {
        fCount++;
        newFleetList.push({
          id: df.id,
          name: df.name,
          codename: df.codename,
          description: df.description || `Fleet discovered from Hermes daemon`,
          purpose: 'Custom Swarm',
          status: 'ACTIVE',
          nodeCluster: 'local.hermes.daemon',
          vramAllocated: 'Dynamic VRAM',
          defaultModelId: df.model || portalSettings.connection.connectedAgentModel || 'hermes-agent',
          color: '#00f2fe',
          isLiveHermesProfile: true,
          isMockup: false
        });
      });

      // Register discovered profiles as agents (and fleets if not present)
      const newAgentList: Agent[] = [];
      res.profiles.forEach(dp => {
        pCount++;
        const pFleetId = dp.fleetId || (newFleetList[0]?.id) || `fleet-${dp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        
        // Ensure fleet exists for this profile
        if (!newFleetList.some(f => f.id === pFleetId)) {
          newFleetList.push({
            id: pFleetId,
            name: dp.name,
            codename: dp.codename || `FLEET-${dp.name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
            description: dp.description || `Profile fleet discovered from Hermes daemon: ${dp.name}`,
            purpose: 'Core Production',
            status: 'ACTIVE',
            nodeCluster: 'local.hermes.daemon',
            vramAllocated: 'Dynamic VRAM',
            defaultModelId: dp.model || portalSettings.connection.connectedAgentModel || 'hermes-agent',
            color: '#10b981',
            isLiveHermesProfile: true,
            profileName: dp.name,
            isMockup: false
          });
        }

        newAgentList.push({
          id: `agent-${dp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: dp.name,
          codename: dp.codename || `HERMES-${dp.name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
          role: dp.role || dp.description || `Autonomous agent profile: ${dp.name}`,
          fleetId: pFleetId,
          status: 'ONLINE',
          statusColor: 'tertiary',
          avatarIcon: 'psychology',
          avatarPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
          description: dp.description || `Live Hermes profile: ${dp.name}`,
          activeModelId: dp.model || portalSettings.connection.connectedAgentModel || 'hermes-agent',
          latencyLabel: `${pingMs}ms • HERMES LIVE`,
          contextUsed: 1024,
          contextTotal: 128000,
          uptime: 'Live',
          slasHealth: '100% Operational',
          memoryArchitecture: ['Live Context', 'Hermes Daemon'],
          assignedTasks: [],
          tools: dp.tools && dp.tools.length > 0 ? dp.tools : (dp.skills && dp.skills.length > 0 ? dp.skills : ['bash_sandbox', 'file_editor']),
          allocationPercent: 100,
          soulPrompt: dp.soulPrompt,
          isLiveHermesProfile: true,
          profileName: dp.name,
          isMockup: false
        });
      });

      // Purge mockups and install discovered fleets & agents
      setFleets(prev => {
        const liveExisting = prev.filter(f => !f.isMockup && f.id !== 'fleet-alpha-core' && f.id !== 'fleet-dev-synth' && f.id !== 'fleet-deep-oracle' && f.id !== 'fleet-sec-sentinel');
        const merged = [...newFleetList];
        liveExisting.forEach(ef => {
          if (!merged.some(m => m.id === ef.id)) merged.push(ef);
        });
        return merged.length > 0 ? merged : [createLiveHermesFleet()];
      });

      setAgents(prev => {
        const liveExisting = prev.filter(a => !a.isMockup && !a.id.startsWith('agent-0') && a.id !== 'hermes-prime' && a.id !== 'code-synthesizer' && a.id !== 'test-vanguard' && a.id !== 'research-oracle' && a.id !== 'citation-auditor' && a.id !== 'ops-sentry' && a.id !== 'data-weaver' && a.id !== 'security-sentinel');
        const merged = [...newAgentList];
        liveExisting.forEach(ea => {
          if (!merged.some(m => m.id === ea.id)) merged.push(ea);
        });
        return merged.length > 0 ? merged : [createLiveHermesAgent()];
      });

      if (newFleetList.length > 0) {
        setActiveFleetId(newFleetList[0].id);
      }

      setPortalSettings(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          connectionStatus: 'CONNECTED',
          isLiveMode: true,
          mockDataPurged: true,
          lastSyncTimestamp: new Date().toISOString()
        }
      }));

      try {
        localStorage.setItem(MOCK_PURGED_KEY, 'true');
      } catch {}

      showToast(`Successfully synced ${pCount} profile(s) and ${fCount} fleet(s) from Hermes!`);
      return {
        success: true,
        discoveredProfilesCount: pCount,
        discoveredFleetsCount: fCount,
        message: `Successfully imported ${pCount} profile(s) and ${fCount} fleet(s) from Hermes!`
      };
    } catch (err: any) {
      return {
        success: false,
        discoveredProfilesCount: 0,
        discoveredFleetsCount: 0,
        message: `Sync failed: ${err.message}`
      };
    }
  };

  const syncWithRealHermesAgent = async (force = false): Promise<boolean> => {
    if (force) {
      const primaryModel = portalSettings.connection.connectedAgentModel || 'hermes-agent';
      const liveFleet = createLiveHermesFleet('Hermes Live Swarm', 'FLEET-LIVE-HERMES', primaryModel);
      const liveAgent = createLiveHermesAgent(primaryModel, 12, undefined, undefined, liveFleet.id);

      setFleets([liveFleet]);
      setAgents([liveAgent]);
      setTasks([]);
      setArtifacts([]);
      setActiveFleetId(liveFleet.id);

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: timeStr,
          agentName: 'Hermes Agent',
          action: 'FORCE_REAL_MODE',
          target: portalSettings.connection.serverUrl,
          status: 'SUCCESS',
          details: `Enforced Real Agent mode on ${portalSettings.connection.serverUrl}. All mock data purged.`
        },
        ...prev
      ]);

      setPortalSettings(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          connectionStatus: 'CONNECTED',
          isLiveMode: true,
          mockDataPurged: true,
          connectedAgentModel: primaryModel,
          availableModels: prev.connection.availableModels && prev.connection.availableModels.length > 0
            ? prev.connection.availableModels
            : [primaryModel],
          lastSyncTimestamp: new Date().toISOString(),
          lastSyncError: undefined
        }
      }));

      try {
        localStorage.setItem(MOCK_PURGED_KEY, 'true');
        localStorage.removeItem(TASKS_STORAGE_KEY);
        localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify([liveAgent]));
        localStorage.setItem(FLEETS_STORAGE_KEY, JSON.stringify([liveFleet]));
      } catch (e) {
        console.error('Failed to save live agent sync', e);
      }

      showToast('Real Hermes Agent mode activated with zero mockup data!');
      return true;
    }

    const res = await testHermesConnection(
      portalSettings.connection.serverUrl,
      portalSettings.connection.authToken
    );

    if (res.ok) {
      const primaryModel = res.models?.[0] || 'hermes-agent';
      const liveFleet = createLiveHermesFleet('Hermes Live Swarm', 'FLEET-LIVE-HERMES', primaryModel);
      const liveAgent = createLiveHermesAgent(primaryModel, res.latencyMs, res.skills, res.toolsets, liveFleet.id);

      // Keep any user-created fleets, purge mockups
      setFleets(prev => {
        const liveOnly = prev.filter(f => !f.isMockup && f.id !== 'fleet-alpha-core' && f.id !== 'fleet-dev-synth' && f.id !== 'fleet-deep-oracle' && f.id !== 'fleet-sec-sentinel');
        return liveOnly.length > 0 ? liveOnly : [liveFleet];
      });

      setAgents(prev => {
        const liveOnly = prev.filter(a => !a.isMockup && !a.id.startsWith('agent-0') && a.id !== 'hermes-prime' && a.id !== 'code-synthesizer' && a.id !== 'test-vanguard' && a.id !== 'research-oracle' && a.id !== 'citation-auditor' && a.id !== 'ops-sentry' && a.id !== 'data-weaver' && a.id !== 'security-sentinel');
        return liveOnly.length > 0 ? liveOnly : [liveAgent];
      });

      setTasks([]);
      setArtifacts([]);

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      setEvents(prev => [
        {
          id: `evt-${Date.now()}`,
          timestamp: timeStr,
          agentName: 'Hermes Agent',
          action: 'LIVE_SYNC',
          target: portalSettings.connection.serverUrl,
          status: 'SUCCESS',
          details: `Connected to live daemon (${portalSettings.connection.serverUrl}). Model: ${primaryModel} (${res.latencyMs}ms). Discovered ${res.models.length} model(s).`
        },
        ...prev
      ]);

      setPortalSettings(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          connectionStatus: 'CONNECTED',
          lastHeartbeatPingMs: res.latencyMs,
          isLiveMode: true,
          mockDataPurged: true,
          connectedAgentModel: primaryModel,
          availableModels: res.models,
          discoveredSkills: res.skills,
          discoveredToolsets: res.toolsets,
          gatewayVersion: res.version,
          lastSyncTimestamp: new Date().toISOString(),
          lastSyncError: undefined
        }
      }));

      try {
        localStorage.setItem(MOCK_PURGED_KEY, 'true');
        localStorage.removeItem(TASKS_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to save live agent sync', e);
      }

      // Automatically attempt to discover profiles and fleets created on the daemon
      syncHermesProfilesAndFleets().catch(() => {});

      showToast(`Connected & Synced with live Hermes Agent (${primaryModel})!`);
      return true;
    } else {
      setPortalSettings(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          connectionStatus: 'DISCONNECTED',
          lastSyncError: res.error,
          availableModels: prev.connection.availableModels && prev.connection.availableModels.length > 0
            ? prev.connection.availableModels
            : ['hermes-agent']
        }
      }));
      showToast(`Sync notice: ${res.error || 'Hermes gateway unreachable on ' + portalSettings.connection.serverUrl}`);
      return false;
    }
  };

  const exportClusterSnapshot = (): string => {
    const snapshot = {
      version: '4.2.0',
      system: 'Hermes Mission Control OS',
      exportTimestamp: new Date().toISOString(),
      operator: operatorProfile,
      portalSettings,
      routingConfig,
      fleets,
      agents,
      tasks,
      artifacts
    };

    const jsonString = JSON.stringify(snapshot, null, 2);

    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `hermes-cluster-snapshot-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to trigger file download', err);
    }

    setPortalSettings(prev => ({
      ...prev,
      backup: {
        ...prev.backup,
        lastBackupTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      }
    }));

    addActivityEvent({
      agent: 'Hermes Vault',
      category: 'GATEWAY',
      text: `Full cluster snapshot exported (${fleets.length} fleets, ${agents.length} agents, ${tasks.length} tasks, ${artifacts.length} artifacts)`,
      status: 'BACKUP OK',
      statusType: 'success'
    });

    showToast('Cluster snapshot exported & downloaded');
    return jsonString;
  };

  const importClusterSnapshot = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || (!data.fleets && !data.agents && !data.tasks)) {
        showToast('Invalid cluster snapshot file structure');
        return false;
      }

      if (data.fleets && Array.isArray(data.fleets)) {
        setFleets(data.fleets);
        localStorage.setItem(FLEETS_STORAGE_KEY, JSON.stringify(data.fleets));
      }
      if (data.agents && Array.isArray(data.agents)) {
        setAgents(data.agents);
        localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(data.agents));
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data.tasks));
      }
      if (data.artifacts && Array.isArray(data.artifacts)) {
        setArtifacts(data.artifacts);
      }
      if (data.routingConfig) {
        setRoutingConfig(data.routingConfig);
      }
      if (data.portalSettings) {
        setPortalSettings(data.portalSettings);
        localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(data.portalSettings));
      }

      addActivityEvent({
        agent: 'Hermes Vault',
        category: 'GATEWAY',
        text: `Cluster state restored from snapshot (Exported: ${data.exportTimestamp || 'Archive'})`,
        status: 'RESTORED',
        statusType: 'success'
      });

      showToast('Cluster successfully restored from snapshot');
      return true;
    } catch (e) {
      console.error('Snapshot restore failed', e);
      showToast('Error parsing snapshot JSON file');
      return false;
    }
  };

  const resetClusterToDefaults = () => {
    setFleets(INITIAL_FLEETS);
    setAgents(INITIAL_AGENTS);
    setTasks(INITIAL_TASKS);
    setArtifacts(INITIAL_ARTIFACTS);
    setRoutingConfig(INITIAL_FLEET_ROUTING_CONFIG);
    setPortalSettings(DEFAULT_PORTAL_SETTINGS);
    setActiveFleetId('fleet-alpha-core');

    localStorage.removeItem(FLEETS_STORAGE_KEY);
    localStorage.removeItem(AGENTS_STORAGE_KEY);
    localStorage.removeItem(TASKS_STORAGE_KEY);
    localStorage.removeItem(PORTAL_SETTINGS_KEY);
    localStorage.removeItem(ACTIVE_FLEET_KEY);

    addActivityEvent({
      agent: 'Hermes Kernel',
      category: 'GATEWAY',
      text: 'Cluster state wiped and restored to factory defaults',
      status: 'FACTORY RESET',
      statusType: 'warning'
    });

    showToast('Cluster state reset to initial factory defaults');
  };

  return (
    <ClusterContext.Provider
      value={{
        tasks,
        agents,
        events,
        fleets,
        artifacts,
        routingConfig,
        portalSettings,
        activeFleetId,
        activeFleet,
        activeAgents,
        activeTasks,
        operatorProfile,
        toast,
        availableModels,
        refreshHermesModels,
        setActiveFleetId,
        createFleet,
        deleteFleet,
        registerHermesProfileAndFleet,
        syncHermesProfilesAndFleets,
        setFleets,
        setArtifacts,
        addArtifact,
        updateRoutingConfig,
        addRoutingRule,
        updateRoutingRule,
        deleteRoutingRule,
        addHandoffRule,
        updateHandoffRule,
        deleteHandoffRule,
        updatePortalSettings,
        updateConnectionSettings,
        updateStorageSettings,
        updateBrandingSettings,
        updatePreferenceSettings,
        updateBackupSettings,
        exportClusterSnapshot,
        importClusterSnapshot,
        resetClusterToDefaults,
        testConnectionPing,
        purgeMockData,
        restoreMockData,
        syncWithRealHermesAgent,
        moveTask,
        createTask,
        setTasks,
        setAgents,
        setEvents,
        updateAgentSoul,
        updateAgentMemories,
        changeAgentModel,
        autoBalanceFleet,
        killAgentTask,
        deployAgent,
        reassignAgentFleet,
        updateAgentPhoto,
        updateOperatorProfile,
        addActivityEvent,
        showToast
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
};

export const useCluster = (): ClusterContextType => {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
};
