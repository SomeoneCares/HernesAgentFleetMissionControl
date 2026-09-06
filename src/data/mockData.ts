import { Agent, ModelOption, ActivityEvent, TaskItem, ChatMessage, ArtifactItem, Fleet, FleetRoutingConfig } from '../types';

export const INITIAL_FLEETS: Fleet[] = [
  {
    id: 'fleet-alpha-core',
    name: 'Primary Orchestration Fleet',
    codename: 'FLEET-ALPHA-CORE',
    description: 'Master mission control, task decomposition, global telemetry, and multi-agent coordination.',
    purpose: 'Core Production',
    status: 'ACTIVE',
    nodeCluster: 'node-01.us-east.h100 (80GB SXM5)',
    vramAllocated: '68.4 / 80 GB',
    defaultModelId: 'hermes-3-405b-instruct',
    color: '#00f2fe'
  },
  {
    id: 'fleet-dev-synth',
    name: 'Autonomous Code & Dev Fleet',
    codename: 'FLEET-DEV-SYNTH',
    description: 'Full-stack software engineering, AST refactoring, automated testing, and cargo builds.',
    purpose: 'Autonomous Dev & Code',
    status: 'ACTIVE',
    nodeCluster: 'node-02.us-east.h100 (80GB SXM5)',
    vramAllocated: '52.1 / 80 GB',
    defaultModelId: 'qwen-2-5-coder-32b',
    color: '#10b981'
  },
  {
    id: 'fleet-deep-oracle',
    name: 'Research & Knowledge Oracle',
    codename: 'FLEET-DEEP-ORACLE',
    description: 'Multi-hop web crawl, Arxiv technical synthesis, fact validation, and semantic vector graphs.',
    purpose: 'Research & Synthesis',
    status: 'ACTIVE',
    nodeCluster: 'node-03.eu-west.l40s (48GB PCIe)',
    vramAllocated: '34.8 / 48 GB',
    defaultModelId: 'hermes-3-70b-fp8',
    color: '#a855f7'
  },
  {
    id: 'fleet-sec-sentinel',
    name: 'Zero-Trust Security Sentinel Fleet',
    codename: 'FLEET-SEC-SENTINEL',
    description: 'Real-time prompt injection interception, PII masking, host isolation, and adversarial red-teaming.',
    purpose: 'Security & Infrastructure',
    status: 'ACTIVE',
    nodeCluster: 'node-04.us-central.airgap (RTX 6000 Ada)',
    vramAllocated: '28.2 / 48 GB',
    defaultModelId: 'hermes-2-pro-8b-guard',
    color: '#ef4444'
  }
];

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'hermes-3-405b-instruct',
    name: 'Hermes 3 405B Instruct (FP8)',
    provider: 'Nous Research / Self-Hosted',
    latencyMs: 18,
    throughputTps: 42.1,
    costPerM: 2.00,
    contextWindow: '128k',
    tag: 'US-CORE-DIRECT'
  },
  {
    id: 'hermes-2-pro-70b',
    name: 'Hermes 2 Pro 70B [Self-Hosted]',
    provider: 'Nous Research',
    latencyMs: 9,
    throughputTps: 88.4,
    costPerM: 0.80,
    contextWindow: '64k',
    tag: 'EDGE CORE'
  },
  {
    id: 'llama-3-3-70b-vllm',
    name: 'Llama 3.3 70B Groq/vLLM',
    provider: 'Meta / Local Cluster',
    latencyMs: 21,
    throughputTps: 112.0,
    costPerM: 0.60,
    contextWindow: '128k',
    tag: 'HYBRID CLOUD'
  },
  {
    id: 'qwen-2-5-coder-32b',
    name: 'Qwen 2.5 Coder 32B Instruct',
    provider: 'Alibaba / Local GPU',
    latencyMs: 24,
    throughputTps: 94.6,
    costPerM: 0.45,
    contextWindow: '64k',
    tag: 'LOCAL GPU'
  },
  {
    id: 'hermes-3-70b-fp8',
    name: 'Hermes 3 70B FP8',
    provider: 'Nous Research',
    latencyMs: 16,
    throughputTps: 76.5,
    costPerM: 0.75,
    contextWindow: '128k',
    tag: 'PG-NODE-DIRECT'
  },
  {
    id: 'hermes-2-pro-8b-guard',
    name: 'Hermes 2 Pro 8B Guard (Quantized)',
    provider: 'Nous Research / CPU TensorRT',
    latencyMs: 4,
    throughputTps: 220.0,
    costPerM: 0.10,
    contextWindow: '32k',
    tag: 'ZERO LATENCY'
  },
  {
    id: 'deepseek-v3-api',
    name: 'DeepSeek V3 API [Direct Gateway]',
    provider: 'DeepSeek Gateway',
    latencyMs: 35,
    throughputTps: 65.0,
    costPerM: 0.50,
    contextWindow: '128k',
    tag: 'REMOTE GATEWAY'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet API [Fallback]',
    provider: 'Anthropic',
    latencyMs: 40,
    throughputTps: 58.0,
    costPerM: 3.00,
    contextWindow: '200k',
    tag: 'FALLBACK ROUTE'
  }
];

export const AGENT_AVATAR_PRESETS = [
  { id: 'neural-core', name: 'Neural Core Alpha', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' },
  { id: 'cyber-dev', name: 'Cyber Dev Synth', url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=80' },
  { id: 'sentinel-blue', name: 'Optic Sentinel', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
  { id: 'scholar-oracle', name: 'Deep Scholar', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80' },
  { id: 'citation-auditor', name: 'Citation Oracle', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' },
  { id: 'infra-watchdog', name: 'Infra Guard', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: 'data-weaver', name: 'Data Architect', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'proxy-guardian', name: 'Zero-Trust Shield', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' }
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'hermes-prime',
    fleetId: 'fleet-alpha-core',
    name: 'Hermes Prime',
    codename: 'Orchestrator-01 // Primary',
    role: 'Master task decomposition and multi-agent coordination pipeline. Directs global token allocations.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'psychology',
    avatarPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    description: 'Master task decomposition and multi-agent coordination pipeline. Directs global token allocations.',
    activeModelId: 'hermes-3-405b-instruct',
    latencyLabel: '18ms • US-CORE-DIRECT',
    contextUsed: 43520,
    contextTotal: 128000,
    uptime: '42d 18h',
    slasHealth: '99.98% Healthy',
    memoryArchitecture: ['Shared Vector RAG', 'Ephemeral KV', 'Temp: 0.20'],
    assignedTasks: [
      { id: '#8910', title: 'Triaging multi-repo security patch', active: true },
      { id: '#8911', title: 'Synthesizing fleet daily briefing' }
    ],
    tools: ['cluster_telemetry_fetch', 'dispatch_lora_adapter', 'quarum_evaluator'],
    allocationPercent: 38
  },
  {
    id: 'code-synthesizer',
    fleetId: 'fleet-dev-synth',
    name: 'CodeSynthesizer',
    codename: 'Agent-02 // Developer',
    role: 'Code generation, automated test synthesis, and continuous pull request reviews across repositories.',
    status: 'BUSY',
    statusColor: 'primary',
    avatarIcon: 'code_blocks',
    avatarPhoto: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=80',
    description: 'Code generation, automated test synthesis, and continuous pull request reviews across repositories.',
    activeModelId: 'qwen-2-5-coder-32b',
    latencyLabel: '24ms • LOCAL GPU',
    contextUsed: 49920,
    contextTotal: 64000,
    uptime: '14d 02h',
    slasHealth: '8 Active Queues',
    memoryArchitecture: ['Docker Active', 'Git', 'Python REPL', 'AST Parser'],
    assignedTasks: [
      { id: '#9021', title: 'Refactoring async gateway handlers', active: true }
    ],
    activeTask: {
      title: 'Refactoring async gateway handlers',
      pid: '9021',
      fileOrSource: 'File: src/net/stream.ts',
      progress: 78
    },
    tools: ['git_diff_apply', 'python_ast_sandbox', 'cargo_test_runner'],
    allocationPercent: 29
  },
  {
    id: 'test-vanguard',
    fleetId: 'fleet-dev-synth',
    name: 'TestVanguard',
    codename: 'Agent-07 // QA Automaton',
    role: 'End-to-end sandbox validation, regression fuzzing, and API conformance test verification.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'flame',
    avatarPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    description: 'End-to-end sandbox validation, regression fuzzing, and API conformance test verification.',
    activeModelId: 'hermes-2-pro-70b',
    latencyLabel: '9ms • EDGE CORE',
    contextUsed: 22100,
    contextTotal: 64000,
    uptime: '19d 06h',
    slasHealth: '4 Test Suites Live',
    memoryArchitecture: ['Vitest Runner', 'Playwright Sandbox', 'Pytest Worker'],
    assignedTasks: [
      { id: '#7740', title: 'Running fuzz tests on JSON schema parser', active: true }
    ],
    tools: ['sandbox_exec', 'coverage_reporter', 'mock_generator'],
    allocationPercent: 20
  },
  {
    id: 'research-oracle',
    fleetId: 'fleet-deep-oracle',
    name: 'ResearchOracle',
    codename: 'Agent-03 // Telemetry Scout',
    role: 'Deep web exploration, technical paper synthesis, Arxiv crawling, and competitor telemetry indexation.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'travel_explore',
    avatarPhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    description: 'Deep web exploration, technical paper synthesis, Arxiv crawling, and competitor telemetry indexation.',
    activeModelId: 'hermes-3-70b-fp8',
    latencyLabel: '32ms • HYBRID CLOUD',
    contextUsed: 62400,
    contextTotal: 128000,
    uptime: '28d 11h',
    slasHealth: '4 Active Tasks',
    memoryArchitecture: ['Web Search', 'Jina Reader', 'Arxiv API'],
    assignedTasks: [
      { id: '#8940', title: 'Synthesizing distributed KV cache benchmark reports', active: true }
    ],
    activeTask: {
      title: 'Synthesizing distributed KV cache benchmark reports',
      fileOrSource: 'Source: arXiv:2412.08891 • 44 pages indexed',
      progress: 60
    },
    tools: ['web_crawler', 'arxiv_extractor', 'vector_embed_generator'],
    allocationPercent: 18
  },
  {
    id: 'citation-auditor',
    fleetId: 'fleet-deep-oracle',
    name: 'CitationAuditor',
    codename: 'Agent-08 // Arxiv Verifier',
    role: 'Cross-referencing technical claims against peer-reviewed preprints and generating verifiable BibTeX trees.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'brain',
    avatarPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    description: 'Cross-referencing technical claims against peer-reviewed preprints and generating verifiable BibTeX trees.',
    activeModelId: 'hermes-3-405b-instruct',
    latencyLabel: '18ms • US-CORE-DIRECT',
    contextUsed: 31200,
    contextTotal: 128000,
    uptime: '11d 14h',
    slasHealth: '100% Fact-Check Pass',
    memoryArchitecture: ['Crossref API', 'Semantic Scholar RAG'],
    assignedTasks: [
      { id: '#6612', title: 'Validating transformer KV compression math claims', active: true }
    ],
    tools: ['doi_resolver', 'bibtex_formatter', 'semantic_cosine_verifier'],
    allocationPercent: 15
  },
  {
    id: 'ops-sentry',
    fleetId: 'fleet-alpha-core',
    name: 'OpsSentry',
    codename: 'Agent-04 // Infra Watchdog',
    role: 'Infrastructure watchdog, Kubernetes autoscaler, hardware thermal regulation, and node failover monitor.',
    status: 'MONITORING',
    statusColor: 'secondary',
    avatarIcon: 'shield_with_heart',
    avatarPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    description: 'Infrastructure watchdog, Kubernetes autoscaler, hardware thermal regulation, and node failover monitor.',
    activeModelId: 'hermes-2-pro-70b',
    latencyLabel: '9ms • EDGE CORE',
    contextUsed: 18400,
    contextTotal: 32768,
    uptime: '62d 04h',
    slasHealth: '3 Monitoring Tasks',
    memoryArchitecture: ['Tier 3 Supervised', 'Slack Webhook + PagerDuty'],
    assignedTasks: [
      { id: '#7712', title: 'VRAM sweep on GPU Node 02', active: true }
    ],
    activeTask: {
      title: 'VRAM sweep on GPU Node 02',
      fileOrSource: 'Thermal: 64.2°C nominal',
      progress: 92
    },
    tools: ['nvtop_prober', 'k8s_cordon_node', 'failover_switch'],
    allocationPercent: 15
  },
  {
    id: 'data-weaver',
    fleetId: 'fleet-alpha-core',
    name: 'DataWeaver',
    codename: 'Agent-05 // Relational Engineer',
    role: 'SQL query optimizer, database schema migration validator, and synthetic training dataset generation.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'database',
    avatarPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    description: 'SQL query optimizer, database schema migration validator, and synthetic training dataset generation.',
    activeModelId: 'hermes-3-70b-fp8',
    latencyLabel: '16ms • PG-NODE-DIRECT',
    contextUsed: 38200,
    contextTotal: 65536,
    uptime: '9d 08h',
    slasHealth: '3 Migrations Live',
    memoryArchitecture: ['PostgreSQL Replica', 'ClickHouse Stream'],
    assignedTasks: [
      { id: '#6290', title: 'Partitioned telemetry reindexing', active: true }
    ],
    activeTask: {
      title: 'Partitioned telemetry reindexing',
      fileOrSource: 'ETA 4m',
      progress: 65
    },
    tools: ['pg_explain_analyzer', 'synthetic_data_sampler', 'migration_dryrun'],
    allocationPercent: 12
  },
  {
    id: 'security-sentinel',
    fleetId: 'fleet-sec-sentinel',
    name: 'SecuritySentinel',
    codename: 'Agent-06 // Redact & Guard',
    role: 'Real-time prompt injection detection, PII / secret redaction, and semantic output safety verification.',
    status: 'GUARD ACTIVE',
    statusColor: 'error',
    avatarIcon: 'security',
    avatarPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    description: 'Real-time prompt injection detection, PII / secret redaction, and semantic output safety verification.',
    activeModelId: 'hermes-2-pro-8b-guard',
    latencyLabel: '4ms • ZERO LATENCY',
    contextUsed: 8900,
    contextTotal: 32768,
    uptime: '45d 19h',
    slasHealth: 'Standing by',
    memoryArchitecture: ['Jailbreak Guard', 'PII Redact', 'API Key Mask'],
    assignedTasks: [
      { id: '#SEC-01', title: '0 Injection Threats intercepted (ALL SECURE)', active: true }
    ],
    activeTask: {
      title: 'Real-time prompt injection intercept stream',
      fileOrSource: 'Zero host privilege breakout',
      progress: 100
    },
    tools: ['llama_guard_v3', 'secret_redactor', 'adversarial_fuzzer'],
    allocationPercent: 8
  }
];

export const INITIAL_ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'evt-1',
    timestamp: '14:32:08.129',
    agent: 'CodeSynthesizer',
    category: 'AGENT',
    text: 'Tool execution git_diff_apply on repo hermes-core',
    detail: 'git_diff_apply',
    status: 'SUCCESS (242ms)',
    statusType: 'success',
    duration: '242ms'
  },
  {
    id: 'evt-2',
    timestamp: '14:31:54.802',
    agent: 'Gateway',
    category: 'MODEL',
    text: 'Context caching auto-applied for hash #8f2a1b',
    detail: '#8f2a1b',
    status: 'SAVED 14.2k TOKENS',
    statusType: 'saved'
  },
  {
    id: 'evt-3',
    timestamp: '14:30:19.441',
    agent: 'OpsSentry',
    category: 'AGENT',
    text: 'Triggered auto-scale check: GPU headroom +22% available on US-EAST-01',
    status: 'SCALE NOMINAL',
    statusType: 'info'
  },
  {
    id: 'evt-4',
    timestamp: '14:28:44.910',
    agent: 'Guardrails',
    category: 'SECURITY',
    text: 'Prompt validation passed: toxicity score 0.01%, safety clean',
    status: 'PASSED (1.2ms)',
    statusType: 'success',
    duration: '1.2ms'
  },
  {
    id: 'evt-5',
    timestamp: '14:26:12.003',
    agent: 'ResearchOracle',
    category: 'AGENT',
    text: 'Completed web vector synthesis across 18 verified academic repositories',
    status: '6,412 TOKENS',
    statusType: 'info'
  },
  {
    id: 'evt-6',
    timestamp: '14:24:01.884',
    agent: 'DataWeaver',
    category: 'TOOL',
    text: 'Executed pg_explain_analyzer on partitioned telemetry stream: index hit 99.4%',
    status: 'OPTIMIZED',
    statusType: 'success'
  },
  {
    id: 'evt-7',
    timestamp: '14:20:55.102',
    agent: 'Hermes Prime',
    category: 'MODEL',
    text: 'Model weights dynamic hot-swap executed: Hermes 3 70B FP8 allocated to Node-02',
    status: 'SWAP ZERO-DOWNTIME',
    statusType: 'saved'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    hash: 'E419DF08',
    fleetId: 'fleet-dev-synth',
    title: 'Optimize vLLM speculative decode attention masks',
    column: 'todo',
    priority: 'P2 · ELEVATED',
    priorityLevel: 'P2',
    assignedAgent: 'Dev (CodeSynthesizer & vLLM-Kernel-Worker)',
    agentTag: 'Dev',
    tags: ['#VLLM', '#CUDA'],
    subtasksCompleted: 0,
    subtasksTotal: 2,
    slaText: 'Est. 1h 15m',
    slaType: 'time'
  },
  {
    id: 'task-2',
    hash: '76A2BD01',
    fleetId: 'fleet-alpha-core',
    title: 'Design comprehensive managed SOC Hermes fleet study',
    column: 'inprogress',
    priority: 'P1 · CRITICAL',
    priorityLevel: 'P1',
    assignedAgent: 'Owners: Scout, Dev, Scribe, Pixel, Orchestrator. Deliver E2E telemetry audit...',
    agentTag: 'Scout',
    tags: ['#HIGH', '#FLEET-STUDY', '#SOC'],
    subtasksCompleted: 1,
    subtasksTotal: 2,
    slaText: 'SLA: 42m remaining',
    slaType: 'fire',
    metaNote: 'CYCLE #19'
  },
  {
    id: 'task-3',
    hash: 'C6A69A39',
    fleetId: 'fleet-dev-synth',
    title: 'Build modular Managed SOC Hermes installer',
    column: 'inprogress',
    priority: 'P1 · CRITICAL',
    priorityLevel: 'P1',
    assignedAgent: 'Core installer package built and verified. Artifacts: soc-installer-arm64.pkg...',
    agentTag: 'Dev',
    tags: ['#HIGH', '#INSTALLER', '#PKG'],
    subtasksCompleted: 3,
    subtasksTotal: 4,
    slaText: 'Active compilation',
    slaType: 'fire',
    metaNote: 'RUN: #082'
  },
  {
    id: 'task-4',
    hash: '0B4EF203',
    fleetId: 'fleet-dev-synth',
    title: 'Inspect Mission Control task board API/UI',
    column: 'done',
    priority: 'P1 · CRITICAL',
    priorityLevel: 'P1',
    assignedAgent: 'Dev',
    agentTag: 'Dev',
    tags: ['#HIGH', '#API-AUDIT'],
    subtasksCompleted: 1,
    subtasksTotal: 1,
    slaText: 'Verified 14:20 UTC',
    slaType: 'verified',
    metaNote: 'MERGED #441'
  },
  {
    id: 'task-5',
    hash: '8A272A65',
    fleetId: 'fleet-alpha-core',
    title: 'Add task-board operating rule to shared fleet protocol',
    column: 'done',
    priority: 'P1 · CRITICAL',
    priorityLevel: 'P1',
    assignedAgent: 'Orchestrator + Dev',
    agentTag: 'Orchestrator',
    tags: ['#HIGH', '#FLEET-PROTOCOL'],
    subtasksCompleted: 2,
    subtasksTotal: 2,
    slaText: 'Verified 11:05 UTC',
    slaType: 'verified',
    metaNote: 'COMMITTED'
  },
  {
    id: 'task-6',
    hash: '19C4A112',
    fleetId: 'fleet-alpha-core',
    title: 'Rotate SSL cert pool for edge websocket ingress nodes',
    column: 'done',
    priority: 'P2 · ELEVATED',
    priorityLevel: 'P2',
    assignedAgent: 'OpsSentry (ZeroTrust-Auto)',
    agentTag: 'OpsSentry',
    tags: ['#INFRA', '#SECURITY'],
    subtasksCompleted: 3,
    subtasksTotal: 3,
    slaText: 'Verified 09:12 UTC',
    slaType: 'verified',
    metaNote: 'SUCCESS'
  },
  {
    id: 'task-7',
    hash: '3D98A110',
    fleetId: 'fleet-deep-oracle',
    title: 'Index 120 Arxiv preprints on inference speculative decoding',
    column: 'inprogress',
    priority: 'P2 · ELEVATED',
    priorityLevel: 'P2',
    assignedAgent: 'ResearchOracle & CitationAuditor',
    agentTag: 'Scout',
    tags: ['#ARXIV', '#RESEARCH'],
    subtasksCompleted: 1,
    subtasksTotal: 3,
    slaText: 'SLA: 18m remaining',
    slaType: 'fire',
    metaNote: 'INDEXING'
  },
  {
    id: 'task-8',
    hash: '5A11F902',
    fleetId: 'fleet-sec-sentinel',
    title: 'Execute fuzzing matrix against model tool execution endpoints',
    column: 'inprogress',
    priority: 'P1 · CRITICAL',
    priorityLevel: 'P1',
    assignedAgent: 'SecuritySentinel',
    agentTag: 'Security',
    tags: ['#REDTEAM', '#ZERO-TRUST'],
    subtasksCompleted: 4,
    subtasksTotal: 5,
    slaText: 'Active Fuzzer Run',
    slaType: 'fire',
    metaNote: 'ISOLATED'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '14:30',
    text: 'Hermes, run a rapid cluster audit. Attach the latest GPU VRAM snapshot and stream the live telemetry listener code snippet for operator verification.'
  },
  {
    id: 'msg-2',
    sender: 'agent',
    agentName: 'Hermes Prime Orchestrator',
    timestamp: '14:31',
    confidence: '99.8%',
    text: 'Acknowledged, Commander. Executed telemetry probes across **Node-Cluster-Alpha**. All 8x H100 SXM5 nodes are in healthy operation with no thermal divergence detected.\n\n• Total Allocated VRAM: `582.4 GB / 640.0 GB` (91.0%)\n• Inference Engine: `vLLM Speculative Engine v0.6.2`\n• Websocket Pulse Latency: `14ms tick delta`',
    toolExecution: {
      toolName: 'cluster_telemetry_fetch(mode="deep_profiler")',
      status: 'STATUS 200 OK',
      execTime: '42.18ms',
      payloadSize: '12.4 KB (COMPRESSED)',
      callId: '#TLM-98042'
    },
    codeSnippet: {
      fileName: 'telemetry_streamer.py',
      language: 'python',
      code: `import asyncio
import websockets

async def stream_telemetry():
    uri = "wss://telemetry.hermes.cluster.internal/v1"
    async with websockets.connect(uri) as ws:
        while True:
            metric = await ws.recv()
            print(f"[HERMES CORE] {metric}")

asyncio.run(stream_telemetry())`
    },
    attachments: [
      {
        type: 'file',
        fileName: 'hermes_vram_profiler_dump.json',
        fileSize: '2.4 MB',
        sha: '7fbc...892e'
      },
      {
        type: 'image',
        fileName: 'CLUSTER-ALPHA-RACK-02.RAW',
        fileSize: 'SXM5 CLUSTER THERMOGRAPHY',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-AGiYh7K53Pw9_mkXHvrgQkZun5RoYclWKmVCdeGKL503HuNbEBVy4xTrLISrHhWIidvtN9iHzOIobhBPgHgI1oIadp8j-pVq8ZC7okbOtT1CwLz1gYfrqQwE5mCaO26QUnsQZmxLXwRxoVba5U2hIdUKNV1HX4JgkxQDP5jgSaAr6UJOjqQaeeof1K3UwfFlChoEeQiRY3Na0HqR8Rcqk6Hgo-QBYysY9L4nz-To1XhhTdmgKFAkig',
        title: 'Futuristic GPU server rack thermographic telemetry heat map'
      }
    ],
    voiceNote: {
      duration: '0:42',
      transcript: 'All GPU clusters are running at nominal temperatures, no thermal throttling detected across the bus.',
      waveforms: [12, 20, 28, 16, 24, 32, 20, 12, 24, 32, 28, 16, 8, 20, 28, 24, 12, 20, 8, 16, 24, 12, 8]
    }
  }
];

export const INITIAL_ARTIFACTS: ArtifactItem[] = [
  // 1. Markdown (.MD)
  {
    id: 'art-1',
    name: 'kv-cache-optimization-v3.md',
    extension: 'MD',
    agent: 'ResearchOracle // Telemetry Scout',
    agentIcon: 'travel_explore',
    size: '342 KB',
    status: 'Vectorized',
    timestamp: '14m ago (14:18)',
    sha: '7f89b..c2',
    lineCount: 9412,
    proposalHeader: 'TECHNICAL SPECIFICATION // PROPOSAL v3.2',
    previewSummary: 'This synthesis proposes an asynchronous, multi-tiered block paging subsystem designed to throttle memory footprint during 128k+ multi-agent dialogue loops. By prioritizing state vectors based on mutual attention decay, active cluster VRAM drops by up to 64.2%.',
    reductionStat: '-64.2%',
    fidelityStat: '99.88%',
    rawContent: `# Dynamic KV-Cache Paging & Eviction for Long-Horizon Agent Swarms

## Executive Summary
This document defines the high-throughput paging mechanism for Hermes cluster workers.
When dialogue horizons exceed 64,000 tokens, attention weight decay allows tier-2 memory eviction.

### Key Architectural Benchmarks
| Node Cluster | Context Tokens | Baseline VRAM | Paged Attention VRAM | Delta |
| :--- | :--- | :--- | :--- | :--- |
| Node-01 (US-EAST) | 128,000 | 74.2 GB | 26.5 GB | **-64.2%** |
| Node-02 (EU-WEST) | 65,536 | 39.8 GB | 14.1 GB | **-64.5%** |
| Node-03 (APAC) | 32,768 | 21.0 GB | 7.9 GB | **-62.3%** |

\`\`\`python
import torch
from hermes.engine.memory import PagedAttentionPool, EvictionPriority

pool = PagedAttentionPool(
    block_size=16,
    max_context_window=131072,
    eviction_policy=EvictionPriority.HERMES_TEMPORAL_DECAY
)
# Allocation complete
print("[HERMES MEMORY] Paging initialized successfully")
\`\`\`

- [x] Memory kernel validated on H100 SXM5
- [x] Zero loss in semantic recall precision on 10,000 needles benchmark
- [ ] Deploy automatic tier-3 cold storage fallback
`
  },
  // 2. Word Document (.DOCX)
  {
    id: 'art-docx-1',
    name: 'autonomous-agent-sla-and-security-charter.docx',
    extension: 'DOCX',
    agent: 'Hermes Prime // Orchestrator',
    agentIcon: 'psychology',
    size: '1.8 MB',
    status: 'Vectorized',
    timestamp: '28m ago (14:04)',
    sha: '3c89f..a1',
    lineCount: 1840,
    previewSummary: 'Official enterprise charter specifying autonomous agent operational boundaries, SLA compliance thresholds, cryptographic audit trails, and human-in-the-loop escalation gates.',
    docxData: {
      title: 'Hermes Autonomous Agent Swarm Operating Charter',
      subtitle: 'Cluster Governance, Service Level Agreements & Security Guardrails',
      organization: 'Hermes Mission Control // Deep Autonomous Systems Group',
      confidentiality: 'RESTRICTED / OPERATOR CLEARANCE REQUIRED',
      date: 'September 2026',
      author: 'Basem Alsaeed, Master Cluster Architect',
      pages: [
        {
          pageNum: 1,
          sections: [
            {
              heading: '1. Executive Statement of Purpose',
              paragraphs: [
                'This formal operating charter establishes binding operational constraints and autonomy parameters for all neural agents operating across the Hermes cluster host infrastructure.',
                'Under standard mission profiles, autonomous subtask execution is authorized without prior human sign-off provided that token expenditure remains under allocated budget thresholds and cryptographic checksums verify sandbox containment.'
              ]
            },
            {
              heading: '2. Multi-Tier Service Level Objectives (SLOs)',
              paragraphs: [
                'All autonomous agents must adhere to strict latency bounds and uptime criteria. Breach of tier-1 SLO immediately trips automated fleet handoffs and notifies the primary operator.'
              ],
              table: {
                headers: ['Mission Tier', 'Target Latency', 'Availability SLO', 'Allowed Handoff Hops'],
                rows: [
                  ['Tier 1: Critical Orchestration', '< 25ms p99', '99.99%', 'Max 1 Hop'],
                  ['Tier 2: Code Synthesis & Builds', '< 120ms p95', '99.95%', 'Max 3 Hops'],
                  ['Tier 3: Asynchronous Research', '< 800ms p90', '99.50%', 'Max 5 Hops']
                ]
              }
            }
          ]
        },
        {
          pageNum: 2,
          sections: [
            {
              heading: '3. Zero-Trust Security Enforcement',
              paragraphs: [
                'No agent within any partitioned fleet may execute system-level binary modifications, credential extraction, or external socket binding without signed token authorization from the master operator.',
                'The Security Sentinel fleet continuously monitors all stdout/stderr streams via hardware-isolated TAP interfaces to intercept potential prompt injections, data exfiltration vectors, or unauthorized resource consumption.'
              ]
            },
            {
              heading: '4. Ratification and Operator Sign-Off',
              paragraphs: [
                'Authorized by Operator OP-7740. All fleet nodes have synchronized this charter into active state vectors. Automated enforcement active.'
              ]
            }
          ]
        }
      ]
    }
  },
  // 3. Excel Spreadsheet (.XLSX)
  {
    id: 'art-xlsx-1',
    name: 'cluster-gpu-cost-and-vram-allocation-q3.xlsx',
    extension: 'XLSX',
    agent: 'DataWeaver // Pipeline Synthesizer',
    agentIcon: 'database',
    size: '890 KB',
    status: 'In Cache',
    timestamp: '45m ago (13:47)',
    sha: '9d21e..ff',
    lineCount: 3500,
    previewSummary: 'Interactive financial ledger and telemetry ledger breaking down VRAM allocation, electricity consumption, token burning rates, and compute costs across all four operational fleets.',
    spreadsheetData: {
      sheets: [
        {
          name: 'Fleet_VRAM_Allocation',
          headers: ['Fleet Partition', 'Host Node', 'GPU Cores', 'Allocated VRAM', 'Active Agents', 'Utilization %', 'Thermal Avg'],
          rows: [
            ['Alpha Core Fleet', 'node-01.us-east.h100', '8x H100 SXM5', '68.4 / 80 GB', 'Hermes Prime + OpsSentry', '85.5%', '54°C'],
            ['Dev & Code Fleet', 'node-02.us-east.h100', '8x H100 SXM5', '52.1 / 80 GB', 'CodeSynthesizer + GitWorker', '65.1%', '51°C'],
            ['Research Oracle Fleet', 'node-03.eu-west.h100', '8x H100 SXM5', '61.8 / 80 GB', 'ResearchOracle + Citation', '77.2%', '58°C'],
            ['Security Sentinel Fleet', 'node-04.us-east.h100', '4x L40S Tensor', '24.0 / 48 GB', 'SecuritySentinel + Redact', '50.0%', '42°C'],
            ['TOTALS / FLEET SUMMARY', '4 Distributed Clusters', '28 GPUs Total', '206.3 / 288 GB', '8 Primary Agents', '71.6% Avg', '51.2°C']
          ]
        },
        {
          name: 'Token_Burn_&_Cost',
          headers: ['Date Interval', 'Prompt Tokens (M)', 'Completion Tokens (M)', 'Cached Tokens (M)', 'API Equiv Cost', 'Local Server Cost', 'Total Net Savings'],
          rows: [
            ['2026-09-01 (Mon)', '412.5M', '98.2M', '240.1M', '$1,840.50', '$142.10', '$1,698.40'],
            ['2026-09-02 (Tue)', '520.1M', '114.6M', '310.4M', '$2,310.20', '$142.10', '$2,168.10'],
            ['2026-09-03 (Wed)', '489.0M', '105.8M', '280.9M', '$2,150.00', '$142.10', '$2,007.90'],
            ['2026-09-04 (Thu)', '601.4M', '135.2M', '390.2M', '$2,780.40', '$142.10', '$2,638.30'],
            ['2026-09-05 (Today)', '380.2M', '84.0M', '225.0M', '$1,620.00', '$142.10', '$1,477.90'],
            ['Q3 CUMULATIVE', '2,403.2M', '537.8M', '1,446.6M', '$10,701.10', '$710.50', '$9,990.60']
          ]
        },
        {
          name: 'Model_Throughput_Bench',
          headers: ['Model ID', 'Quantization', 'Inference Engine', 'Prompt TPS', 'Generation TPS', 'First-Token Latency'],
          rows: [
            ['hermes-3-405b-instruct', 'FP8 Native', 'vLLM Speculative Engine', '1,420 TPS', '72.4 TPS', '18.2ms'],
            ['hermes-3-70b-fp8', 'FP8 High-Precision', 'TensorRT-LLM', '2,850 TPS', '144.8 TPS', '11.5ms'],
            ['qwen-2-5-coder-32b', 'AWQ 4-bit', 'vLLM Kernel', '3,900 TPS', '182.0 TPS', '8.4ms'],
            ['hermes-2-pro-8b-guard', 'FP16 Dedicated', 'ONNX Runtime CPU', '6,200 TPS', '280.5 TPS', '3.8ms']
          ]
        }
      ]
    }
  },
  // 4. PowerPoint Presentation (.PPTX)
  {
    id: 'art-pptx-1',
    name: 'hermes-mission-control-architecture-keynote.pptx',
    extension: 'PPTX',
    agent: 'Basem Alsaeed // Lead Architect',
    agentIcon: 'terminal',
    size: '4.6 MB',
    status: 'In Cache',
    timestamp: '1h 10m ago',
    sha: '8a11b..04',
    lineCount: 450,
    previewSummary: 'Executive presentation deck covering Hermes Mission Control unified dashboard, multi-fleet partitioning, zero-downtime hot swapping, cybernetic UI customization, and WebRTC real-time comms.',
    presentationData: {
      slides: [
        {
          id: 1,
          title: 'Hermes Mission Control',
          subtitle: 'Federated Autonomous Agent Fleet Architecture // Q3 2026',
          visualType: 'quote',
          bullets: [
            'Next-generation command & control interface for distributed neural agents',
            'Zero auxiliary server footprint — runs directly alongside host agent runtimes',
            'Seamless operator supervision with sub-20ms telemetry feedback loops'
          ],
          notes: 'Open by highlighting how this unified UI replaces fragmented CLI scripts and standalone monitoring tools.'
        },
        {
          id: 2,
          title: 'Multi-Fleet Autonomous Partitioning',
          subtitle: 'Isolating Workloads Across Dedicated GPU Clusters',
          visualType: 'architecture',
          bullets: [
            'Alpha Core: Master orchestration, global memory, and high-level routing',
            'Dev & Code: Pull request synthesis, linting, and automated testing swarms',
            'Research Oracle: Arxiv crawler, vector embeddings, and mathematical proof validation',
            'Security Sentinel: Hardware-isolated zero-trust filtering and prompt defense'
          ],
          notes: 'Explain that operators can dynamically reassign agents or partition new fleets without restarting nodes.'
        },
        {
          id: 3,
          title: 'Dynamic Routing & Intelligent Handoffs',
          subtitle: 'Zero-Latency Cross-Fleet Task Delegation',
          visualType: 'timeline',
          bullets: [
            'Intent Affinity Matrix: Automatically classifies prompt domain to target fleet',
            'Autonomous Handoff Triggers: Low confidence (<72%) triggers escalation',
            'Context Window Compaction: Automatic handoff when token horizon exceeds 85%',
            'Circuit Breakers: Intercepts repeated tool failures and requests operator guidance'
          ],
          notes: 'Showcase the new Fleet Routing and Handoff modal with interactive rule simulations.'
        },
        {
          id: 4,
          title: 'System Telemetry & Cost Optimization',
          subtitle: 'Real-Time Benchmarks & Token Savings',
          visualType: 'metrics',
          bullets: [
            '91.0% VRAM Efficiency achieved via KV-Cache temporal decay paging',
            '64.2% Reduction in peak memory consumption during 128k long-context dialogues',
            'Estimated $9,990+ weekly infrastructure savings vs cloud proprietary APIs',
            'WebRTC low-latency audio/video communication channel built-in'
          ],
          notes: 'Direct attention to the live telemetry charts and the comprehensive content library previewers.'
        },
        {
          id: 5,
          title: 'Roadmap & Future Horizons',
          subtitle: 'Pushing Towards Complete Sovereign Autonomy',
          visualType: 'diagram',
          bullets: [
            'Phase 1: Multi-Fleet UI & Real-Time Comms (Shipped & Active)',
            'Phase 2: Decentralized P2P Mesh Inter-Cluster Synchronization',
            'Phase 3: Autonomous LoRA Adapter Fine-Tuning Loops in Background VRAM',
            'Phase 4: Fully air-gapped sovereign hardware enclosures'
          ],
          notes: 'Wrap up with Q&A and invitation to customize theme skins and test the cyber pet companion.'
        }
      ]
    }
  },
  // 5. PDF Document (.PDF)
  {
    id: 'art-pdf-1',
    name: 'speculative-decoding-distributed-agent-swarms.pdf',
    extension: 'PDF',
    agent: 'ResearchOracle // Telemetry Scout',
    agentIcon: 'travel_explore',
    size: '2.4 MB',
    status: 'Vectorized',
    timestamp: '2h ago (12:30)',
    sha: '5b90f..33',
    lineCount: 2200,
    previewSummary: 'Formal academic paper detailing speculative decoding speedups in multi-agent asynchronous conversational topologies, complete with mathematical theorems, latency tables, and benchmark proofs.',
    pdfData: {
      totalPages: 4,
      title: 'Speculative Decoding & State Paging in Distributed Autonomous Agent Swarms',
      authors: 'Hermes Research Group, Basem Alsaeed, Deep Autonomous Systems Lab',
      affiliation: 'Hermes Autonomous Systems Initiative // Technical Report TR-2026-09',
      abstractText: 'In long-horizon multi-agent dialogues exceeding 128,000 context tokens, standard autoregressive inference exhibits severe memory bandwidth bottlenecks. We introduce a federated speculative decoding protocol utilizing lightweight draft workers (Hermes 2 Pro 8B) running in lockstep with a 405B teacher model. Empirical evaluations on an 8x H100 SXM5 cluster demonstrate a 3.1x throughput acceleration while preserving 99.88% output fidelity.',
      pages: [
        {
          pageNum: 1,
          header: 'SECTION 1: INTRODUCTION & DISTRIBUTED TOPOLOGY',
          sections: [
            {
              heading: '1. Introduction and Background',
              paragraphs: [
                'Autonomous multi-agent swarms operate under dynamic conversational topologies where context accumulation grows quadratically across turns.',
                'Existing transformer deployments typically suffer from memory-bound memory stall cycles during key-value generation phases.'
              ]
            },
            {
              heading: '2. Mathematical Formulation',
              paragraphs: [
                'Let M_target denote the primary 405B parameter model and M_draft denote the localized 8B draft verification network. The speculative acceptance ratio alpha is given by:'
              ],
              mathEq: '\\alpha = \\min\\left(1, \\frac{P_{\\text{target}}(x_{t+k} \\mid x_{<t+k})}{P_{\\text{draft}}(x_{t+k} \\mid x_{<t+k})}\\right)',
              highlightBox: 'Theorem 1 (Zero-Degradation Invariance): When rejected tokens are resampled from the normalized residual distribution, the output distribution of the swarm is mathematically identical to direct sampling from M_target.'
            }
          ]
        },
        {
          pageNum: 2,
          header: 'SECTION 2: MEMORY HIERARCHY & ATTENTION COMPACTION',
          sections: [
            {
              heading: '3. Hierarchical KV Paging Protocol',
              paragraphs: [
                'We subdivide active GPU memory into hot, warm, and cold tiers. Hot memory retains immediate dialogue turns, whereas older memory blocks undergo temporal attention decay.',
                'When attention decay exceeds threshold lambda, blocks are paged to host system RAM via high-bandwidth PCIe Gen 5 interfaces without interrupting active token generation.'
              ]
            },
            {
              heading: '4. Experimental Setup',
              paragraphs: [
                'All tests were executed on 4 interconnected host clusters equipped with NVIDIA H100 SXM5 accelerators and NVLink interconnects running vLLM speculative engine v0.6.2.'
              ],
              highlightBox: 'Cluster Configuration: 32x H100 80GB SXM5 • RoCE v2 400 Gb/s Networking • Host OS: Ubuntu 24.04 LTS Kernel 6.8'
            }
          ]
        },
        {
          pageNum: 3,
          header: 'SECTION 3: BENCHMARKS & EMPIRICAL RESULTS',
          sections: [
            {
              heading: '5. Empirical Throughput Benchmark',
              paragraphs: [
                'Evaluation across 10,000 multi-turn programming, math, and code review dialogues demonstrated consistent speedups across varying context depths.'
              ],
              highlightBox: 'Throughput: Baseline 405B = 22.4 TPS • Speculative Drafted = 71.8 TPS (3.2x Acceleration) • Median Acceptance Rate: 78.4%'
            },
            {
              heading: '6. Ablation on Multi-Fleet Handoffs',
              paragraphs: [
                'When routing specialized tasks (e.g. security audits or math proofs) to dedicated fine-tuned 70B fleets, overall latency dropped by an additional 41.5% compared to monolithic dispatch.'
              ]
            }
          ]
        },
        {
          pageNum: 4,
          header: 'SECTION 4: CONCLUSION & REFERENCES',
          sections: [
            {
              heading: '7. Conclusion & Operational Impact',
              paragraphs: [
                'We have demonstrated that combining speculative decoding with multi-fleet workload partitioning provides orders-of-magnitude improvements in both throughput and memory efficiency.',
                'The open implementation has been deployed into Hermes Mission Control v4.2 and is operational across production swarms.'
              ]
            },
            {
              heading: '8. References',
              paragraphs: [
                '[1] Leviathan, Y., et al. "Fast Inference from Transformers via Speculative Decoding." ICML 2023.',
                '[2] Kwon, W., et al. "Efficient Memory Management for Large Language Models with PagedAttention." SOSP 2023.',
                '[3] Hermes Autonomous Systems Initiative. "Multi-Fleet Coordination Architecture." TR-2026-04.'
              ]
            }
          ]
        }
      ]
    }
  },
  // 6. Photos & Graphics (.PNG / .JPG)
  {
    id: 'art-photo-1',
    name: 'sxm5-gpu-rack-thermographic-telemetry.png',
    extension: 'PNG',
    agent: 'OpsSentry // Node Watcher',
    agentIcon: 'shield_with_heart',
    size: '5.2 MB',
    status: 'In Cache',
    timestamp: '3h ago (11:20)',
    sha: '11fe4..90',
    lineCount: 1,
    previewSummary: 'High-resolution thermographic sensor capture of the Node-01 8x H100 SXM5 compute tray operating under peak 128k context speculative decoding load.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
    imageMetadata: {
      dimensions: '3840 × 2160 (4K UHD)',
      colorProfile: 'sRGB IEC61966-2.1',
      cameraSensor: 'FLIR Industrial Infrared A6700sc MWIR',
      colorHistogram: [15, 28, 45, 62, 85, 98, 92, 70, 48, 30, 18, 10]
    }
  },
  {
    id: 'art-photo-2',
    name: 'satellite-edge-neural-array-optics.jpg',
    extension: 'JPG',
    agent: 'ResearchOracle // Telemetry Scout',
    agentIcon: 'travel_explore',
    size: '3.8 MB',
    status: 'Vectorized',
    timestamp: '4h ago (10:15)',
    sha: '88c12..3b',
    lineCount: 1,
    previewSummary: 'High-altitude optical downlink imagery validating laser interconnect communication between orbital edge server pods and ground station gateway.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    imageMetadata: {
      dimensions: '4096 × 2304 (DCI 4K)',
      colorProfile: 'Display P3 Wide Gamut',
      cameraSensor: 'Multispectral Spacecraft Sensor MK-IV',
      colorHistogram: [8, 19, 32, 54, 78, 95, 88, 64, 42, 22, 14, 6]
    }
  },
  // Existing Code & Config artifacts
  {
    id: 'art-2',
    name: 'patch-async-stream-gateway.py',
    extension: 'PY',
    agent: 'CodeSynthesizer // Developer',
    agentIcon: 'code_blocks',
    size: '18.4 KB',
    status: 'In Cache',
    timestamp: '42m ago (13:50)',
    sha: '1e42a..09',
    lineCount: 420,
    previewSummary: 'Hotfix for high-concurrency websocket connection pools on US-EAST-01, introducing backpressure throttles.',
    rawContent: `import asyncio
import uvloop

async def handle_stream(reader, writer):
    buffer = await reader.read(4096)
    # Applied zero-copy telemetry forwarding
    writer.write(buffer)
    await writer.drain()
`
  },
  {
    id: 'art-3',
    name: 'cluster-topology-snapshot-20251014.json',
    extension: 'JSON',
    agent: 'OpsSentry // Node Watcher',
    agentIcon: 'shield_with_heart',
    size: '4.2 MB',
    status: 'Vectorized',
    timestamp: '1h ago (13:12)',
    sha: '9b12c..55',
    lineCount: 12400,
    previewSummary: 'Full JSON dump of NVLink bandwidth, interconnect topologies, temperature deltas, and PCIe link negotiation.'
  },
  {
    id: 'art-4',
    name: 'synthetic-eval-reasoning-prompts.parquet',
    extension: 'PARQUET',
    agent: 'DataWeaver // Pipeline Synthesizer',
    agentIcon: 'database',
    size: '18.6 MB',
    status: 'Cold Storage',
    timestamp: '3h ago (11:04)',
    sha: '34ff2..81',
    lineCount: 50000,
    previewSummary: '50,000 synthetic math and multi-step reasoning validation samples generated for Hermes fine-tuning benchmarks.'
  },
  {
    id: 'art-5',
    name: 'guardrail-redaction-rules-v4.yaml',
    extension: 'YAML',
    agent: 'SecuritySentinel // Threat Intel',
    agentIcon: 'security',
    size: '8.9 KB',
    status: 'Vectorized',
    timestamp: '5h ago (09:15)',
    sha: '6d01e..4a',
    lineCount: 310,
    previewSummary: 'YAML rule definitions for PII regex masking, canary token alerts, and prompt injection vector classifications.'
  }
];

export const INITIAL_FLEET_ROUTING_CONFIG: FleetRoutingConfig = {
  defaultStrategy: 'intent-affinity',
  fallbackFleetId: 'fleet-alpha-core',
  enableCrossFleetHandoffs: true,
  autoEscalateOnP1: true,
  maxHandoffHops: 3,
  heartbeatIntervalSec: 15,
  routingRules: [
    {
      id: 'rule-sec-01',
      name: 'Zero-Trust & Security Interception',
      enabled: true,
      priority: 1,
      conditionType: 'topic_keyword',
      conditionValue: 'security, auth, cve, inject, redteam, pii, audit, vulnerability, threat, jailbreak',
      targetFleetId: 'fleet-sec-sentinel',
      targetAgentId: 'security-sentinel',
      fallbackFleetId: 'fleet-alpha-core',
      action: 'ROUTE_IMMEDIATE',
      description: 'Isolate prompt security checks, adversarial scanning, and credential redacting directly to Sentinel fleet.'
    },
    {
      id: 'rule-p1-critical',
      name: 'P1 Critical Priority Escalation',
      enabled: true,
      priority: 2,
      conditionType: 'priority_level',
      conditionValue: 'P1',
      targetFleetId: 'fleet-alpha-core',
      targetAgentId: 'hermes-prime',
      fallbackFleetId: 'fleet-alpha-core',
      action: 'DELEGATE_SUPERVISED',
      description: 'Route all P1 emergency tasks directly to Hermes Prime with quorum supervision across all nodes.'
    },
    {
      id: 'rule-dev-code',
      name: 'Code Synthesis & Pull Request Pipeline',
      enabled: true,
      priority: 3,
      conditionType: 'topic_keyword',
      conditionValue: 'code, git, pr, refactor, bugfix, compile, typescript, python, diff, unit test, build',
      targetFleetId: 'fleet-dev-synth',
      targetAgentId: 'code-synthesizer',
      fallbackFleetId: 'fleet-alpha-core',
      action: 'ROUTE_IMMEDIATE',
      description: 'Direct code creation, diff verification, and unit test generation to the developer agent swarm.'
    },
    {
      id: 'rule-arxiv-research',
      name: 'Deep Literature & Arxiv Synthesis',
      enabled: true,
      priority: 4,
      conditionType: 'topic_keyword',
      conditionValue: 'research, arxiv, paper, citation, benchmark, literature, theory, math, survey',
      targetFleetId: 'fleet-deep-oracle',
      targetAgentId: 'research-oracle',
      fallbackFleetId: 'fleet-alpha-core',
      action: 'ROUTE_IMMEDIATE',
      description: 'Send multi-source literature surveys, vector cross-referencing, and mathematical audits to Research Oracle.'
    },
    {
      id: 'rule-data-sql',
      name: 'SQL Query & Dataset Stream Processing',
      enabled: true,
      priority: 5,
      conditionType: 'topic_keyword',
      conditionValue: 'sql, postgres, clickhouse, schema, migration, parquet, dataset, etl, database',
      targetFleetId: 'fleet-alpha-core',
      targetAgentId: 'data-weaver',
      fallbackFleetId: 'fleet-dev-synth',
      action: 'ROUTE_IMMEDIATE',
      description: 'Dispatch database schema migrations and synthetic dataset generation to DataWeaver worker.'
    }
  ],
  handoffRules: [
    {
      id: 'handoff-conf-01',
      name: 'Low Confidence Autonomous Escalation',
      enabled: true,
      triggerType: 'confidence_threshold',
      triggerOperator: '<',
      triggerThreshold: 0.72,
      unitLabel: 'confidence score',
      sourceFleetId: 'ALL_FLEETS',
      targetFleetId: 'fleet-alpha-core',
      contextPreservation: 'full_tokens',
      humanApprovalRequired: false,
      autoAckTimeoutSec: 8,
      description: 'If agent confidence drops below 72%, trigger immediate handoff to Orchestrator Prime.'
    },
    {
      id: 'handoff-ctx-02',
      name: 'Context Saturation Checkpoint',
      enabled: true,
      triggerType: 'context_exhaustion',
      triggerOperator: '>=',
      triggerThreshold: 85,
      unitLabel: '% of context window',
      sourceFleetId: 'ALL_FLEETS',
      targetFleetId: 'fleet-deep-oracle',
      contextPreservation: 'summarized_kv',
      humanApprovalRequired: false,
      autoAckTimeoutSec: 10,
      description: 'When context consumption hits 85%, handoff to Deep Oracle for recursive KV-cache compaction and state paging.'
    },
    {
      id: 'handoff-retry-03',
      name: 'Tool Failure Circuit Breaker',
      enabled: true,
      triggerType: 'error_retry_limit',
      triggerOperator: '>=',
      triggerThreshold: 3,
      unitLabel: 'consecutive failures',
      sourceFleetId: 'ALL_FLEETS',
      targetFleetId: 'fleet-sec-sentinel',
      contextPreservation: 'state_machine_only',
      humanApprovalRequired: true,
      autoAckTimeoutSec: 15,
      description: 'Trip circuit breaker on 3 consecutive tool execution errors and handoff to Security Sentinel for quarantine.'
    },
    {
      id: 'handoff-sla-04',
      name: 'SLA Breach Warning Fast-Track',
      enabled: true,
      triggerType: 'sla_breach_warning',
      triggerOperator: '<',
      triggerThreshold: 180,
      unitLabel: 'seconds until breach',
      sourceFleetId: 'ALL_FLEETS',
      targetFleetId: 'fleet-alpha-core',
      contextPreservation: 'full_tokens',
      humanApprovalRequired: false,
      autoAckTimeoutSec: 5,
      description: 'Fast-track critical tasks within 3 minutes of SLA expiry to Alpha Core high-priority queue.'
    }
  ]
};
