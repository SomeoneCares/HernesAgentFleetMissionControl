export type TabType = 'overview' | 'agents' | 'tasks' | 'chat' | 'library';

export type SkinTheme = 
  | 'hermes-cyber'     // Cyber Obsidian & Neon Cyan
  | 'tactical-emerald' // Matrix / Terminal Phosphor Green
  | 'solar-amber'      // Neuromancer Industrial Amber & Gold
  | 'sunset-synth'     // Cyberpunk Synthwave Magenta & Violet
  | 'oled-monolith'    // Pitch Black OLED & Titanium Ice Blue
  | 'alpine-daylight'; // Crisp Architectural Executive White (Light Mode)

export interface SkinOption {
  id: SkinTheme;
  name: string;
  tagline: string;
  category: 'dark' | 'light';
  accentColor: string;
  secondaryColor: string;
  bgColor: string;
  cardColor: string;
  borderColor: string;
  swatches: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  latencyMs: number;
  throughputTps: number;
  costPerM: number;
  contextWindow: string;
  tag: string;
}

export interface Fleet {
  id: string;
  name: string;
  codename: string;
  description: string;
  purpose: 'Core Production' | 'Autonomous Dev & Code' | 'Research & Synthesis' | 'Security & Infrastructure' | 'Custom Swarm';
  status: 'ACTIVE' | 'STANDBY' | 'DEGRADED';
  nodeCluster: string;
  vramAllocated: string;
  defaultModelId: string;
  color: string; // Hex or theme color for badge
  isLiveHermesProfile?: boolean;
  profileName?: string;
  serverUrl?: string;
  isMockup?: boolean;
}

export interface AgentMemoryItem {
  id: string;
  title: string;
  category: 'Core Principles' | 'Episodic Experience' | 'Procedural Knowledge' | 'Working Context' | 'Factoid & System';
  content: string;
  importance: number; // 0.1 to 1.0
  tokenCount: number;
  lastAccessed: string;
  tags: string[];
}

export interface Agent {
  id: string;
  name: string;
  codename: string;
  role: string;
  fleetId?: string;
  status: 'ONLINE' | 'BUSY' | 'MONITORING' | 'GUARD ACTIVE' | 'STANDBY';
  statusColor: 'tertiary' | 'primary' | 'secondary' | 'error' | 'warning';
  avatarIcon: string;
  avatarPhoto?: string;
  description: string;
  activeModelId: string;
  latencyLabel: string;
  contextUsed: number;
  contextTotal: number;
  uptime: string;
  slasHealth: string;
  memoryArchitecture: string[];
  assignedTasks: { id: string; title: string; active?: boolean }[];
  activeTask?: {
    title: string;
    pid?: string;
    fileOrSource?: string;
    progress?: number;
    eta?: string;
  };
  tools: string[];
  allocationPercent: number;
  soulPrompt?: string;
  memories?: AgentMemoryItem[];
  isLiveHermesProfile?: boolean;
  profileName?: string;
  isMockup?: boolean;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agent: string;
  category: 'AGENT' | 'MODEL' | 'SECURITY' | 'GATEWAY' | 'TOOL';
  text: string;
  detail?: string;
  status: string;
  statusType: 'success' | 'info' | 'saved' | 'warning';
  duration?: string;
}

export interface TaskItem {
  id: string;
  hash: string;
  title: string;
  fleetId?: string;
  column: 'todo' | 'inprogress' | 'done';
  priority: 'P1 · CRITICAL' | 'P2 · ELEVATED' | 'P3 · NORMAL';
  priorityLevel: 'P1' | 'P2' | 'P3';
  assignedAgent: string;
  agentTag: 'Dev' | 'Orchestrator' | 'Scout' | 'OpsSentry' | 'Security';
  tags: string[];
  subtasksCompleted: number;
  subtasksTotal: number;
  slaText: string;
  slaType: 'fire' | 'time' | 'verified';
  metaNote?: string;
}

export interface AgentActivityStep {
  step: number;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp?: string;
  detail?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentName?: string;
  timestamp: string;
  text: string;
  confidence?: string;
  thought?: string;
  reasoningSteps?: string[];
  currentActivity?: string;
  activitySteps?: AgentActivityStep[];
  toolExecution?: {
    toolName: string;
    status: string;
    execTime: string;
    payloadSize: string;
    callId: string;
    inputArgs?: string;
    outputResult?: string;
  };
  codeSnippet?: {
    fileName: string;
    language: string;
    code: string;
  };
  attachments?: {
    type: 'file' | 'image';
    fileName: string;
    fileSize: string;
    sha?: string;
    imageUrl?: string;
    title?: string;
  }[];
  voiceNote?: {
    duration: string;
    transcript: string;
    audioUrl?: string;
    waveforms?: number[];
  };
}

export interface ArtifactItem {
  id: string;
  name: string;
  extension: 'MD' | 'PY' | 'JSON' | 'PARQUET' | 'YAML' | 'PDF' | 'CSV' | 'DOCX' | 'XLSX' | 'PPTX' | 'PNG' | 'JPG' | 'SVG' | 'WEBP' | string;
  agent: string;
  agentIcon?: string;
  size: string;
  status: 'Vectorized' | 'In Cache' | 'Cold Storage' | 'HOT_MEMORY' | string;
  timestamp: string;
  sha: string;
  lineCount?: number;
  proposalHeader?: string;
  previewSummary?: string;
  reductionStat?: string;
  fidelityStat?: string;
  rawContent?: string;
  imageUrl?: string;
  imageMetadata?: {
    dimensions: string;
    colorProfile?: string;
    colorSpace?: string;
    cameraSensor?: string;
    sensorCamera?: string;
    aspectRatio?: string;
    bitDepth?: string;
    focalLength?: string;
    iso?: string;
    exposure?: string;
    colorHistogram?: number[];
  };
  spreadsheetData?: {
    sheets: {
      name: string;
      headers: string[];
      rows: (string | number)[][];
    }[];
  };
  presentationData?: {
    slides: {
      id: number;
      title: string;
      subtitle?: string;
      bullets?: string[];
      visualType?: 'architecture' | 'metrics' | 'timeline' | 'quote' | 'diagram';
      notes?: string;
    }[];
  };
  docxData?: {
    title: string;
    subtitle?: string;
    organization: string;
    confidentiality: string;
    date: string;
    author: string;
    pages: {
      pageNum: number;
      sections: {
        heading?: string;
        paragraphs: string[];
        table?: {
          headers: string[];
          rows: string[][];
        };
      }[];
    }[];
  };
  pdfData?: any;
}

export type RoutingStrategy = 
  | 'intent-affinity' 
  | 'least-loaded' 
  | 'round-robin' 
  | 'priority-urgency' 
  | 'context-window-fit';

export interface FleetRoutingRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditionType: 'topic_keyword' | 'priority_level' | 'token_budget' | 'task_type' | 'model_affinity' | 'regex';
  conditionValue: string;
  targetFleetId: string;
  targetAgentId?: string;
  fallbackFleetId: string;
  action: 'ROUTE_IMMEDIATE' | 'ROUTE_WITH_CONFIRM' | 'FORK_PARALLEL' | 'DELEGATE_SUPERVISED';
  description?: string;
}

export interface FleetHandoffRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: 'confidence_threshold' | 'context_exhaustion' | 'error_retry_limit' | 'permission_escalation' | 'sla_breach_warning';
  triggerOperator: '<' | '>' | '>=' | '==';
  triggerThreshold: number;
  unitLabel: string;
  sourceFleetId: string; // or 'ALL_FLEETS'
  targetFleetId: string;
  contextPreservation: 'full_tokens' | 'summarized_kv' | 'state_machine_only';
  humanApprovalRequired: boolean;
  autoAckTimeoutSec: number;
  description: string;
}

export interface FleetRoutingConfig {
  defaultStrategy: RoutingStrategy;
  fallbackFleetId: string;
  enableCrossFleetHandoffs: boolean;
  autoEscalateOnP1: boolean;
  maxHandoffHops: number;
  heartbeatIntervalSec: number;
  autoRebalanceOnSaturation?: boolean;
  routingRules: FleetRoutingRule[];
  handoffRules: FleetHandoffRule[];
}

export interface UserProfile {
  callsign: string;
  name: string;
  role: string;
  authLevel: string;
  photoUrl: string;
  bio?: string;
  email?: string;
}

export type PetSpecies = 'falcon' | 'cat' | 'wyrm' | 'drone' | 'k9';
export type PetMood = 'happy' | 'alert' | 'curious' | 'sleeping' | 'hacking';

export interface PetConfig {
  enabled: boolean;
  species: PetSpecies;
  name: string;
  mood: PetMood;
  accessory: 'none' | 'visor' | 'halo' | 'jetpack' | 'crown' | 'headphones';
  auraColor: string;
  chimesEnabled: boolean;
  position: 'docked-right' | 'docked-left' | 'floating';
  happiness: number;
  hunger: number;
  lastInteraction: string;
}

export interface CustomPlugin {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'audio' | 'telemetry' | 'utility';
  enabled: boolean;
  version: string;
  author: string;
  icon: string;
  configurable?: boolean;
  settings?: Record<string, any>;
}

export interface CustomThemeConfig {
  accentColor: string;
  secondaryColor: string;
  bgColor: string;
  cardColor: string;
  borderColor: string;
  glowIntensity: 'none' | 'subtle' | 'high' | 'overclocked';
  glassmorphism: boolean;
  fontScaling: 'compact' | 'standard' | 'spacious';
}

export interface PortalConnectionSettings {
  serverUrl: string;
  protocol: 'HTTP_REST' | 'GRPC_WEB' | 'WEBSOCKET' | 'UNIX_SOCKET';
  authToken: string;
  verifyTls: boolean;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'LOCAL_STANDALONE';
  clusterRegion: string;
  heartbeatIntervalSec: number;
  lastHeartbeatPingMs: number;
  isLiveMode?: boolean; // When true, mock data is disabled and app connects to real Hermes daemon
  mockDataPurged?: boolean; // Indicates user has wiped all mock placeholders
  connectedAgentModel?: string; // Model reported by real Hermes agent (e.g. hermes-agent)
  availableModels?: string[]; // Live model IDs retrieved from /v1/models
  discoveredSkills?: string[]; // Skills discovered from /v1/skills
  discoveredToolsets?: string[]; // Toolsets discovered from /v1/toolsets
  gatewayVersion?: string; // Hermes Gateway version from /health
  lastSyncTimestamp?: string; // ISO string of last successful sync
  lastSyncError?: string; // Last connection or sync error diagnostic
}

export interface PortalStorageSettings {
  libraryFolderPath: string;
  ipfsGatewayUrl: string;
  s3BucketEndpoint?: string;
  storageQuotaGb: number;
  autoPurgeDays: number;
  compressOnIngest: boolean;
  vectorIndexMemoryMb: number;
}

export interface PortalPreferenceSettings {
  defaultFleetId: string;
  defaultLandingTab: TabType;
  telemetryLogRetention: number;
  soundAlertsEnabled: boolean;
  autoRebalanceSatThreshold: number;
  refreshIntervalSec: number;
}

export interface PortalBackupSettings {
  autoBackupSchedule: 'OFF' | 'HOURLY' | 'EVERY_6_HOURS' | 'DAILY' | 'WEEKLY';
  lastBackupTimestamp?: string;
  backupTargetLocation: 'LOCAL_DOWNLOAD' | 'SERVER_DISK' | 'S3_REMOTE';
  includeAgentMemories: boolean;
  includeArtifactFiles: boolean;
  encryptBackups: boolean;
}

export interface PortalBrandingSettings {
  portalName: string;
  portalTagline: string;
  organizationName: string;
  versionBadge: string;
  logoIcon: string;
  customLogoUrl?: string;
  accentColor: string;
  footerDisclaimer: string;
  showOrgBadge: boolean;
}

export interface PortalSettings {
  connection: PortalConnectionSettings;
  storage: PortalStorageSettings;
  branding: PortalBrandingSettings;
  preferences: PortalPreferenceSettings;
  backup: PortalBackupSettings;
}

