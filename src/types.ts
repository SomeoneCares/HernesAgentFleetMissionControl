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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentName?: string;
  timestamp: string;
  text: string;
  confidence?: string;
  toolExecution?: {
    toolName: string;
    status: string;
    execTime: string;
    payloadSize: string;
    callId: string;
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
  extension: 'MD' | 'PY' | 'JSON' | 'PARQUET' | 'YAML' | 'PDF' | 'CSV';
  agent: string;
  agentIcon: string;
  size: string;
  status: 'Vectorized' | 'In Cache' | 'Cold Storage';
  timestamp: string;
  sha: string;
  lineCount?: number;
  proposalHeader?: string;
  previewSummary?: string;
  reductionStat?: string;
  fidelityStat?: string;
  rawContent?: string;
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

