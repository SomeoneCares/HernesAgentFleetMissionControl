import { Agent, ModelOption, ActivityEvent, TaskItem, ChatMessage, ArtifactItem } from '../types';

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

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'hermes-prime',
    name: 'Hermes Prime',
    codename: 'Orchestrator-01 // Primary',
    role: 'Master task decomposition and multi-agent coordination pipeline. Directs global token allocations.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'psychology',
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
    name: 'CodeSynthesizer',
    codename: 'Agent-02 // Developer',
    role: 'Code generation, automated test synthesis, and continuous pull request reviews across repositories.',
    status: 'BUSY',
    statusColor: 'primary',
    avatarIcon: 'code_blocks',
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
    id: 'research-oracle',
    name: 'ResearchOracle',
    codename: 'Agent-03 // Telemetry Scout',
    role: 'Deep web exploration, technical paper synthesis, Arxiv crawling, and competitor telemetry indexation.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'travel_explore',
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
    id: 'ops-sentry',
    name: 'OpsSentry',
    codename: 'Agent-04 // Infra Watchdog',
    role: 'Infrastructure watchdog, Kubernetes autoscaler, hardware thermal regulation, and node failover monitor.',
    status: 'MONITORING',
    statusColor: 'secondary',
    avatarIcon: 'shield_with_heart',
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
    name: 'DataWeaver',
    codename: 'Agent-05 // Relational Engineer',
    role: 'SQL query optimizer, database schema migration validator, and synthetic training dataset generation.',
    status: 'ONLINE',
    statusColor: 'tertiary',
    avatarIcon: 'database',
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
    name: 'SecuritySentinel',
    codename: 'Agent-06 // Redact & Guard',
    role: 'Real-time prompt injection detection, PII / secret redaction, and semantic output safety verification.',
    status: 'GUARD ACTIVE',
    statusColor: 'error',
    avatarIcon: 'security',
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

\`\`\`python
import torch
from hermes.engine.memory import PagedAttentionPool, EvictionPriority

pool = PagedAttentionPool(
    block_size=16,
    max_context_window=131072,
    eviction_policy=EvictionPriority.HERMES_TEMPORAL_DECAY
)
\`\`\`
`
  },
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
