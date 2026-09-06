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

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  connection: {
    serverUrl: 'http://localhost:8080',
    protocol: 'HTTP_REST',
    authToken: 'hermes-live-sk-99812408-ae71f',
    verifyTls: true,
    connectionStatus: 'CONNECTED',
    clusterRegion: 'US-EAST-CORE-01',
    heartbeatIntervalSec: 5,
    lastHeartbeatPingMs: 14
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
  setActiveFleetId: (fleetId: string) => void;
  createFleet: (newFleet: Fleet) => void;
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

export const ClusterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize portal settings
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(() => {
    try {
      const saved = localStorage.getItem(PORTAL_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          connection: { ...DEFAULT_PORTAL_SETTINGS.connection, ...parsed.connection },
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
      const saved = localStorage.getItem(FLEETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
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
    return 'fleet-alpha-core';
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
    return INITIAL_TASKS;
  });

  // Initialize agents from localStorage or mockData
  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
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
    return INITIAL_AGENTS;
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
    showToast(`Created & booted fleet [${newFleet.codename}] on host cluster.`);
    addActivityEvent({
      agent: 'Hermes Orchestrator',
      category: 'GATEWAY',
      text: `Host server partitioned new fleet: ${newFleet.name} [${newFleet.codename}]`,
      status: 'PROVISIONED',
      statusType: 'success'
    });
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

  const changeAgentModel = (agentId: string, newModelId: string) => {
    const modelObj = AVAILABLE_MODELS.find(m => m.id === newModelId);
    if (!modelObj) return;

    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          activeModelId: newModelId,
          latencyLabel: `${modelObj.latencyMs}ms • ${modelObj.tag}`
        };
      }
      return ag;
    }));

    showToast(`Updated ${agentId} to ${modelObj.name}`);
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
      if (saved) return JSON.parse(saved);
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
    await new Promise(resolve => setTimeout(resolve, 550));
    const latency = Math.floor(Math.random() * 10) + 11; // 11-20ms
    setPortalSettings(prev => ({
      ...prev,
      connection: {
        ...prev.connection,
        lastHeartbeatPingMs: latency,
        connectionStatus: 'CONNECTED'
      }
    }));
    showToast(`Hermes server handshake verified: ${latency}ms latency`);
    return latency;
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
        setActiveFleetId,
        createFleet,
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
