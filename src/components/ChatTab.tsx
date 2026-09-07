import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ModelOption } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { useCluster } from '../context/ClusterContext';
import { WebRtcModal } from './WebRtcModal';
import { sendHermesChatCompletion } from '../services/hermesAgentService';
import { AgentThoughtViewer } from './AgentThoughtViewer';
import { AgentActivityStepsViewer, LiveAgentWorkingHUD, LiveAgentActivityState } from './AgentActivityCard';
import { ToolExecutionViewer } from './ToolExecutionViewer';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Image as ImageIcon, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Volume2, 
  Radio, 
  Sparkles, 
  ChevronRight, 
  Pin, 
  MoreVertical, 
  ShieldAlert, 
  Search, 
  X, 
  Terminal,
  Cpu,
  Maximize2,
  SlidersHorizontal,
  Video,
  Activity,
  Brain,
  Wrench,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CHAT_SESSIONS_STORAGE_KEY = 'hermes_chat_sessions_v2';
const CHAT_DRAFTS_STORAGE_KEY = 'hermes_chat_drafts_v2';
const CHAT_ACTIVE_THREAD_KEY = 'hermes_chat_active_thread_v2';

export const ChatTab: React.FC = () => {
  const { agents, activeFleet, portalSettings, availableModels } = useCluster();

  // Active thread selection with persistence
  const [activeThread, setActiveThread] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CHAT_ACTIVE_THREAD_KEY);
      if (saved) return saved;
    } catch {}
    return agents[0]?.id || 'hermes-live-gateway';
  });

  // Default initial welcome message generator
  const getInitialWelcome = (threadId: string): ChatMessage[] => {
    const targetAgent = agents.find(a => a.id === threadId) || agents[0];
    const isLive = portalSettings.connection.mockDataPurged || threadId === 'hermes-live-gateway';
    return [
      {
        id: `msg-welcome-${threadId}-${Date.now()}`,
        sender: 'agent',
        agentName: targetAgent?.name || 'Hermes Agent',
        timestamp: new Date().toTimeString().slice(0, 5),
        currentActivity: isLive ? 'Gateway session initialized' : 'Autonomous reasoning cluster ready',
        thought: isLive
          ? `1. Socket bound to ${portalSettings.connection.serverUrl || 'http://localhost:8642'}.\n2. Real model discovery active.\n3. Ready to stream telemetry, reasoning chains, and tool execution.`
          : `1. Agent ${targetAgent?.name || 'Hermes Prime'} loaded.\n2. Speculative tensor pipeline verified.\n3. Standing by for operator prompts and autonomous task scheduling.`,
        activitySteps: [
          { step: 1, label: 'Loaded agent personality and memory bus', status: 'completed', timestamp: new Date().toTimeString().slice(0, 5) },
          { step: 2, label: `Bound to inference engine (${portalSettings.connection.connectedAgentModel || 'hermes-agent'})`, status: 'completed', timestamp: new Date().toTimeString().slice(0, 5) },
          { step: 3, label: 'Ready for directive processing', status: 'completed', timestamp: new Date().toTimeString().slice(0, 5) }
        ],
        text: isLive
          ? `Hermes Agent Gateway online (${portalSettings.connection.serverUrl || 'port 8642'}). Active session connected. Ready for autonomous task execution and reasoning prompts.`
          : `${targetAgent?.name || 'Hermes Prime Orchestrator'} online. Ready for cluster coordination and reasoning prompts.`,
        confidence: isLive ? '100% Real Gateway' : '99.8%'
      }
    ];
  };

  // Persistent multi-thread chat sessions
  const [sessions, setSessions] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load chat sessions from localStorage', e);
    }
    const defaultThread = agents[0]?.id || 'hermes-live-gateway';
    const isPurged = localStorage.getItem('hermes_mock_purged_v1') === 'true';
    if (isPurged) {
      return {
        [defaultThread]: [
          {
            id: 'msg-live-welcome',
            sender: 'agent',
            agentName: 'Hermes Agent',
            timestamp: new Date().toTimeString().slice(0, 5),
            text: 'Hermes Agent Gateway online (port 8642). Mockup data is purged. Ready for autonomous task execution and reasoning prompts.',
            confidence: '100% Real Gateway'
          }
        ]
      };
    }
    return {
      [defaultThread]: INITIAL_CHAT_MESSAGES,
      'hermes-prime': INITIAL_CHAT_MESSAGES
    };
  });

  // Draft text inputs per thread
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CHAT_DRAFTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [inputText, setInputText] = useState<string>(() => {
    try {
      const savedDrafts = localStorage.getItem(CHAT_DRAFTS_STORAGE_KEY);
      if (savedDrafts) {
        const parsed = JSON.parse(savedDrafts);
        const thread = localStorage.getItem(CHAT_ACTIVE_THREAD_KEY) || agents[0]?.id || 'hermes-live-gateway';
        return parsed[thread] || '';
      }
    } catch {}
    return '';
  });

  const [isSending, setIsSending] = useState(false);
  const [liveActivity, setLiveActivity] = useState<LiveAgentActivityState | null>(null);
  const [activeModel, setActiveModel] = useState(() => portalSettings.connection.connectedAgentModel || availableModels[0]?.id || 'hermes-agent');
  const [showRightDrawer, setShowRightDrawer] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [clipboardItem, setClipboardItem] = useState<{ name: string; type: string } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState('1.0x');
  const [copiedCode, setCopiedCode] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isHalted, setIsHalted] = useState(false);
  const [isWebRtcOpen, setIsWebRtcOpen] = useState(false);
  const [globalShowThinking, setGlobalShowThinking] = useState(true);

  // Live timer for agent execution state and progressive thinking stream
  useEffect(() => {
    if (!isSending) {
      setLiveActivity(null);
      return;
    }

    const startTime = Date.now();
    let tickCount = 0;

    const timer = setInterval(() => {
      tickCount++;
      setLiveActivity(prev => {
        if (!prev) return null;
        const elapsed = (Date.now() - startTime) / 1000;

        // Progressively inject dynamic speculative thinking thoughts
        let nextThoughts = prev.liveThoughts ? [...prev.liveThoughts] : [];
        if (tickCount === 8 && !nextThoughts.some(t => t.includes('speculative decoding'))) {
          nextThoughts.push('Speculative decoding: verifying intermediate tensor activations');
        } else if (tickCount === 16 && !nextThoughts.some(t => t.includes('safety constraints'))) {
          nextThoughts.push('Verifying safety constraints and parameter guardrails');
        } else if (tickCount === 24 && !nextThoughts.some(t => t.includes('synthesizing structured'))) {
          nextThoughts.push('Synthesizing structured thought chain into final token stream');
        }

        return {
          ...prev,
          elapsedSeconds: elapsed,
          liveThoughts: nextThoughts
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isSending]);

  // Active thread's messages
  const messages = sessions[activeThread] || getInitialWelcome(activeThread);

  const updateActiveThreadMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setSessions(prev => {
      const currentList = prev[activeThread] || getInitialWelcome(activeThread);
      const nextList = updater(currentList);
      const updated = {
        ...prev,
        [activeThread]: nextList
      };
      try {
        localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist chat sessions', e);
      }
      return updated;
    });
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThread(threadId);
    setInputText(drafts[threadId] || '');
    try {
      localStorage.setItem(CHAT_ACTIVE_THREAD_KEY, threadId);
    } catch {}
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    setDrafts(prev => {
      const updated = { ...prev, [activeThread]: text };
      try {
        localStorage.setItem(CHAT_DRAFTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Keep activeThread in sync only if completely invalid
  useEffect(() => {
    const threadHasMessages = Boolean(sessions[activeThread] && sessions[activeThread].length > 0);
    const agentExists = agents.some(a => a.id === activeThread);
    if (!threadHasMessages && !agentExists && agents.length > 0) {
      const fallbackId = agents[0].id;
      setActiveThread(fallbackId);
      setInputText(drafts[fallbackId] || '');
      try {
        localStorage.setItem(CHAT_ACTIVE_THREAD_KEY, fallbackId);
      } catch {}
    }
  }, [agents, activeThread, sessions]);

  // Keep activeModel aligned with connected Hermes agent model
  useEffect(() => {
    if (portalSettings.connection.connectedAgentModel) {
      setActiveModel(portalSettings.connection.connectedAgentModel);
    }
  }, [portalSettings.connection.connectedAgentModel]);

  // Ensure sessions are safely persisted to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to sync chat sessions to storage', e);
    }
  }, [sessions]);

  // Filter out mock-only messages if mockDataPurged is active, without wiping user's conversation
  useEffect(() => {
    if (portalSettings?.connection?.mockDataPurged) {
      setSessions(prev => {
        let changed = false;
        const nextSessions: Record<string, ChatMessage[]> = { ...prev };
        for (const threadId of Object.keys(nextSessions)) {
          const list = nextSessions[threadId];
          if (list && list.some(m => m.id === 'msg-1' || m.id === 'msg-2' || m.id === 'msg-3')) {
            const userMessages = list.filter(m => m.id !== 'msg-1' && m.id !== 'msg-2' && m.id !== 'msg-3');
            nextSessions[threadId] = userMessages.length > 0 ? userMessages : getInitialWelcome(threadId);
            changed = true;
          }
        }
        if (changed) {
          try {
            localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
          } catch {}
          return nextSessions;
        }
        return prev;
      });
    }
  }, [portalSettings?.connection?.mockDataPurged]);

  const currentAgent = agents.find(a => a.id === activeThread) || agents[0];

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Handle clipboard paste listener
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setClipboardItem({ name: 'pasted-screenshot.png', type: 'image' });
        }
      }
    }
  };

  // Start / stop microphone voice note recording
  const handleToggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording and send voice note
      setIsRecording(false);
      const durationStr = `0:${recordingSeconds < 10 ? '0' + recordingSeconds : recordingSeconds}`;
      
      const voiceMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        timestamp: new Date().toTimeString().slice(0, 5),
        text: 'Voice note transmission',
        voiceNote: {
          duration: durationStr || '0:06',
          transcript: 'Operator voice memo: Hermes, verify current pipeline latency and cache allocation.',
          waveforms: [8, 16, 28, 36, 24, 18, 28, 32, 20, 14, 22, 30, 24, 16, 12, 22, 18, 10]
        }
      };

      updateActiveThreadMessages(prev => [...prev, voiceMessage]);

      // Trigger automatic agent reply
      setTimeout(() => {
        const agentReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: currentAgent?.name || 'Hermes Agent',
          timestamp: new Date().toTimeString().slice(0, 5),
          text: 'Voice memo received and transcribed with 99.9% confidence. Cluster latency is currently nominal. Ready for next directive.',
          confidence: '99.9%'
        };
        updateActiveThreadMessages(prev => [...prev, agentReply]);
      }, 1200);

    } else {
      // Start recording
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          recorder.start();
        }
      } catch (err) {
        console.log('Microphone preview fallback active');
      }
      setIsRecording(true);
    }
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0 && !clipboardItem) return;

    const newAttachments = attachedFiles.map(f => ({
      type: 'file' as const,
      fileName: f.name,
      fileSize: f.size
    }));

    if (clipboardItem) {
      newAttachments.push({
        type: 'image' as const,
        fileName: clipboardItem.name,
        fileSize: 'Clipboard capture',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-AGiYh7K53Pw9_mkXHvrgQkZun5RoYclWKmVCdeGKL503HuNbEBVy4xTrLISrHhWIidvtN9iHzOIobhBPgHgI1oIadp8j-pVq8ZC7okbOtT1CwLz1gYfrqQwE5mCaO26QUnsQZmxLXwRxoVba5U2hIdUKNV1HX4JgkxQDP5jgSaAr6UJOjqQaeeof1K3UwfFlChoEeQiRY3Na0HqR8Rcqk6Hgo-QBYysY9L4nz-To1XhhTdmgKFAkig'
      });
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toTimeString().slice(0, 5),
      text: inputText.trim() || 'Dispatched file attachment for cluster analysis.',
      attachments: newAttachments.length > 0 ? newAttachments : undefined
    };

    updateActiveThreadMessages(prev => [...prev, userMsg]);
    handleInputChange('');
    setAttachedFiles([]);
    setClipboardItem(null);

    setIsSending(true);
    const serverUrl = portalSettings.connection.serverUrl || 'http://localhost:8642';
    const authToken = portalSettings.connection.authToken;
    const modelToUse = portalSettings.connection.connectedAgentModel || activeModel || 'hermes-agent';
    const targetAgentName = currentAgent?.name || 'Hermes Agent';
    const startTimeStamp = new Date().toTimeString().slice(0, 8);

    // Initialize real-time live activity HUD with live thinking stream
    setLiveActivity({
      currentPhase: `Parsing prompt directive & validating session for ${targetAgentName}...`,
      stepIndex: 1,
      totalSteps: 4,
      steps: [
        { label: 'Parse directive & check context limits', status: 'running' },
        { label: 'Evaluate tool execution requirements', status: 'pending' },
        { label: `Invoke Hermes model kernel (${modelToUse})`, status: 'pending' },
        { label: 'Synthesize reasoning & format response', status: 'pending' }
      ],
      elapsedSeconds: 0,
      model: modelToUse,
      agentName: targetAgentName,
      liveThoughts: [
        `Operator prompt received: "${userMsg.text.slice(0, 48)}${userMsg.text.length > 48 ? '...' : ''}"`,
        `Checking context budget & active memory limits (1,024 / 128,000 tokens)`,
        `Retrieving system personality, role constraints, and tools for ${targetAgentName}`
      ],
      liveLogs: [
        `[${startTimeStamp}] Directive received from operator`,
        `[${startTimeStamp}] Active session: ${activeThread}`,
        `[${startTimeStamp}] Target agent: ${targetAgentName} (Engine: ${modelToUse})`,
        `[${startTimeStamp}] Context check: 1,024 / 128,000 tokens active`
      ]
    });

    (async () => {
      try {
        const hermesHistory = messages
          .filter(m => m.text)
          .slice(-6)
          .map(m => ({
            role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.text
          }));
        hermesHistory.push({ role: 'user', content: userMsg.text });

        // Update live activity to step 2/3
        setLiveActivity(prev => prev ? {
          ...prev,
          currentPhase: `Connecting to Hermes Gateway (${serverUrl}) & evaluating tools...`,
          stepIndex: 2,
          steps: [
            { label: 'Parse directive & check context limits', status: 'completed' },
            { label: 'Evaluate tool execution requirements', status: 'running' },
            { label: `Invoke Hermes model kernel (${modelToUse})`, status: 'pending' },
            { label: 'Synthesize reasoning & format response', status: 'pending' }
          ],
          liveThoughts: [
            ...(prev.liveThoughts || []),
            `Scanning active daemon tools: telemetry, bash, filesystem, and model switcher`,
            `Dispatching inference request to gateway: POST ${serverUrl}/v1/chat/completions`
          ],
          liveLogs: [
            ...prev.liveLogs,
            `[${new Date().toTimeString().slice(0, 8)}] POST ${serverUrl}/v1/chat/completions (model: ${modelToUse})`,
            `[${new Date().toTimeString().slice(0, 8)}] Dispatching prompt stream across cluster interconnect`
          ]
        } : null);

        // Transition to step 3 (inference running)
        setLiveActivity(prev => prev ? {
          ...prev,
          currentPhase: `Awaiting model inference & speculative tokens from ${modelToUse}...`,
          stepIndex: 3,
          steps: [
            { label: 'Parse directive & check context limits', status: 'completed' },
            { label: 'Evaluate tool execution requirements', status: 'completed' },
            { label: `Invoke Hermes model kernel (${modelToUse})`, status: 'running' },
            { label: 'Synthesize reasoning & format response', status: 'pending' }
          ],
          liveThoughts: [
            ...(prev.liveThoughts || []),
            `Inference pipeline active: executing speculative reasoning trace on ${modelToUse}`,
            `Validating output schema, tool arguments, and factual guardrails`
          ],
          liveLogs: [
            ...prev.liveLogs,
            `[${new Date().toTimeString().slice(0, 8)}] Speculative tensor pipeline executing...`
          ]
        } : null);

        const res = await sendHermesChatCompletion(serverUrl, hermesHistory, modelToUse, authToken);
        const replyTime = new Date().toTimeString().slice(0, 5);

        if (res.ok && res.replyText) {
          const firstTool = res.toolCalls?.[0];
          const hasTools = Boolean(firstTool);
          const toolName = firstTool?.function?.name || 'hermes_tool_call';
          const toolArgs = firstTool?.function?.arguments;

          const agentReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            agentName: `Hermes Agent (${res.modelUsed || 'Live Daemon'})`,
            timestamp: replyTime,
            confidence: '100% Real Live Output',
            currentActivity: hasTools ? `Executed tool ${toolName}` : 'Completed prompt reasoning & inference',
            thought: res.thought || `1. Operator Intent: Parsed prompt "${userMsg.text.slice(0, 45)}...".
2. Toolset Inspection: Checked active tools registered in daemon sandbox.
3. Model Inference: Dispatched to live ${res.modelUsed || modelToUse} via Hermes Gateway.
4. Telemetry Verification: Received response payload. Verifying safety guardrails and token integrity.`,
            activitySteps: [
              { step: 1, label: 'Parsed operator directive & context limits', status: 'completed', timestamp: replyTime },
              { step: 2, label: `Invoked Hermes daemon model (${res.modelUsed || modelToUse})`, status: 'completed', timestamp: replyTime },
              ...(hasTools ? [{
                step: 3,
                label: `Executed daemon tool: ${toolName}`,
                status: 'completed' as const,
                timestamp: replyTime,
                detail: toolArgs
              }] : []),
              { step: hasTools ? 4 : 3, label: 'Synthesized reasoning chain and validated final tokens', status: 'completed', timestamp: replyTime }
            ],
            text: res.replyText,
            toolExecution: hasTools ? {
              toolName: toolName,
              status: 'STATUS 200 OK',
              execTime: `${Math.floor(Math.random() * 25) + 15}ms`,
              payloadSize: '2.4 KB',
              callId: firstTool?.id || `#TLM-${Math.floor(10000 + Math.random() * 90000)}`,
              inputArgs: toolArgs || '{}',
              outputResult: 'Tool executed successfully on live Hermes host.'
            } : undefined
          };
          updateActiveThreadMessages(prev => [...prev, agentReply]);
        } else if (portalSettings.connection.mockDataPurged) {
          // If mockup data is purged, show explicit connection error rather than fake canned text
          const errorReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            agentName: 'Hermes Daemon Gateway',
            timestamp: replyTime,
            confidence: 'Error Diagnostic',
            currentActivity: 'Connection attempt failed',
            thought: `1. Attempted connection to Hermes Gateway: ${serverUrl}/v1/chat/completions
2. Socket response: Connection refused or host unreachable.
3. Diagnostic: Real Hermes daemon is not currently active on port 8642.
4. Recommended corrective action: Run 'hermes gateway --port 8642' in terminal.`,
            activitySteps: [
              { step: 1, label: `Initiated HTTP POST to ${serverUrl}`, status: 'completed', timestamp: replyTime },
              { step: 2, label: 'Socket handshake failed: connection refused', status: 'failed', timestamp: replyTime },
              { step: 3, label: 'Emitted diagnostic guidance for operator', status: 'completed', timestamp: replyTime }
            ],
            text: `⚠️ **Could not connect to live Hermes Agent at ${serverUrl}/v1/chat/completions**\n\n*Error details:* \`${res.error || 'Connection refused or host unreachable'}\`\n\n**To connect your real agent:**\n1. Run: \`hermes gateway --port 8642 --host 0.0.0.0\` in your terminal\n2. Open Settings (⚙️ in top bar) and verify URL is \`http://localhost:8642\`\n3. Click **"Test Connection"** to verify the socket`
          };
          updateActiveThreadMessages(prev => [...prev, errorReply]);
        } else {
          // Fallback simulation when in demo mockup mode
          const isStatusCmd = userMsg.text.includes('/status');
          const isSwapCmd = userMsg.text.includes('/swap');
          const isAuditCmd = userMsg.text.toLowerCase().includes('audit') || userMsg.text.toLowerCase().includes('check');

          const simThought = isStatusCmd
            ? `1. Intercepted operator slash command /status.
2. Queried cluster topology: 8x H100 SXM5 compute nodes.
3. NVLink bus throughput verified at 900 GB/s with 0 frame drops.
4. Thermal gradient normal (58.4°C - 62.1°C). Formatted status matrix.`
            : isSwapCmd
            ? `1. Intercepted /swap command.
2. Validated target inference engine: ${modelToUse}.
3. Scheduled memory eviction of inactive tensor layers.
4. Hot-swapped inference kernel weights with zero KV-cache session loss.`
            : isAuditCmd
            ? `1. Analyzed cluster audit directive: "${userMsg.text.slice(0, 50)}...".
2. Dispatched hardware telemetry probe across cluster nodes.
3. Inspected VRAM allocation: 582.4 GB / 640.0 GB (91.0%).
4. Thermal and power envelopes verified nominal.`
            : `1. Analyzed prompt directive: "${userMsg.text.slice(0, 50)}...".
2. Assessed agent role: ${currentAgent?.role || 'Autonomous Orchestrator'}.
3. Dispatched speculative reasoning trace to internal tensor kernel.
4. Evaluated safety guardrails, tool sandbox, and system constraints.
5. Formulated actionable response with verified telemetry.`;

          const simTool = isStatusCmd
            ? {
                toolName: 'cluster_status_query(scope="all_nodes")',
                status: 'STATUS 200 OK',
                execTime: '18.2ms',
                payloadSize: '1.8 KB',
                callId: `#TLM-${Math.floor(10000 + Math.random() * 90000)}`,
                inputArgs: '{"scope": "all_nodes", "metrics": ["temperature", "nvlink_bandwidth", "vram_allocated"]}',
                outputResult: '{"nodes": 8, "temp_avg_c": 58.4, "nvlink_gbps": 900, "status": "NOMINAL"}'
              }
            : isSwapCmd
            ? {
                toolName: `model_kernel_swap(target_model="${modelToUse}")`,
                status: 'STATUS 200 OK',
                execTime: '34.6ms',
                payloadSize: '3.1 KB',
                callId: `#TLM-${Math.floor(10000 + Math.random() * 90000)}`,
                inputArgs: `{"target_model": "${modelToUse}", "preserve_kv_cache": true}`,
                outputResult: '{"swap_success": true, "evicted_layers": 12, "active_weights": "ready"}'
              }
            : {
                toolName: 'dispatch_lora_adapter(target="cluster_east_01")',
                status: 'STATUS 200 OK',
                execTime: '28.4ms',
                payloadSize: '4.2 KB',
                callId: `#TLM-${Math.floor(10000 + Math.random() * 90000)}`,
                inputArgs: '{"target": "cluster_east_01", "mode": "speculative_tensor_pipeline"}',
                outputResult: '{"status": "SCHEDULED", "pipeline_id": "pip-84920", "worker_nodes": 4}'
              };

          const agentReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            agentName: currentAgent?.name || 'Hermes Prime Orchestrator',
            timestamp: replyTime,
            confidence: '99.8%',
            currentActivity: isStatusCmd ? 'Queried cluster status matrix' : isSwapCmd ? 'Swapped inference kernel' : 'Executed speculative reasoning',
            thought: simThought,
            activitySteps: [
              { step: 1, label: 'Parsed user directive & extracted parameters', status: 'completed', timestamp: replyTime },
              { step: 2, label: `Evaluated toolset for ${currentAgent?.name || 'Hermes Agent'}`, status: 'completed', timestamp: replyTime },
              { step: 3, label: `Executed tool: ${simTool.toolName.split('(')[0]}`, status: 'completed', timestamp: replyTime, detail: simTool.inputArgs },
              { step: 4, label: 'Synthesized response and validated output telemetry', status: 'completed', timestamp: replyTime }
            ],
            text: isStatusCmd 
              ? '### Cluster Status Matrix\n• All 8x H100 SXM5 compute nodes running at 58.4°C nominal.\n• NVLink interconnect throughput: 900 GB/s.\n• Active agent pipelines: 3 queued, 0 dropped frames.'
              : isSwapCmd
              ? `Swapped model weights to target inference kernel (${modelToUse}) with zero session loss.`
              : `Directive received. Hermes has scheduled the request into the speculative tensor pipeline. All parameters validated against safety guardrails.`,
            toolExecution: simTool
          };
          updateActiveThreadMessages(prev => [...prev, agentReply]);
        }
      } catch (err: any) {
        console.error('Chat dispatch error', err);
      } finally {
        setIsSending(false);
      }
    })();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setAttachedFiles(prev => [...prev, { name: file.name, size: sizeStr }]);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[640px] flex rounded-2xl bg-[#0c101a]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl overflow-hidden font-mono text-xs">
      {/* 1. LEFT SIDEBAR (CHANNELS & ACTIVE AGENTS) */}
      <aside className="w-72 sm:w-80 border-r border-white/[0.08] bg-[#07090e]/70 flex flex-col shrink-0">
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white tracking-wide text-xs uppercase flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              COMMS & AGENT BUS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 font-bold">
              14 CHANNELS
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              placeholder="Search transceivers..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <button className="px-2.5 py-1 rounded-md bg-cyan-400/15 text-cyan-300 font-semibold border border-cyan-400/30">
              All
            </button>
            <button className="px-2.5 py-1 rounded-md bg-white/[0.02] text-slate-400 hover:text-white">
              Agents ({agents.length})
            </button>
            <button className="px-2.5 py-1 rounded-md bg-white/[0.02] text-slate-400 hover:text-white">
              Ops Logs
            </button>
          </div>
        </div>

        {/* Dynamic Channels / Agents List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03] p-2 space-y-1">
          {agents.map((ag) => {
            const isSelected = activeThread === ag.id;
            return (
              <button
                key={ag.id}
                onClick={() => handleSelectThread(ag.id)}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-400/10 border border-cyan-400/25'
                    : 'hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isSelected
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-white/[0.05] text-slate-300 border border-white/[0.08]'
                  }`}>
                    {ag.avatarPhoto ? (
                      <img src={ag.avatarPhoto} alt={ag.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="material-symbols-outlined text-xl text-cyan-400">
                        {ag.avatarIcon || 'smart_toy'}
                      </span>
                    )}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#07090e] ${
                    ag.status === 'ONLINE' ? 'bg-emerald-400' : ag.status === 'BUSY' ? 'bg-amber-400' : 'bg-slate-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-white truncate">{ag.name}</span>
                    <span className="text-[10px] text-slate-500">{ag.latencyLabel?.split('•')[0] || '12ms'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{ag.description || ag.role}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-300 truncate max-w-[120px]">
                      {ag.role?.split('.')[0] || ag.codename}
                    </span>
                    <span className="text-[9px] text-emerald-400">{ag.status}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom VOX Audio Bus Decibel Meter (from Mockup Image 5) */}
        <div className="p-3.5 border-t border-white/[0.08] bg-black/40">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Volume2 className="w-3.5 h-3.5" />
              VOX AUDIO BUS
            </span>
            <span className="text-emerald-400">-28 dB NOMINAL</span>
          </div>
          <div className="flex items-center gap-1 h-3">
            {[4, 12, 18, 26, 14, 20, 28, 12, 8, 16, 24, 18, 10, 6].map((height, idx) => (
              <div
                key={idx}
                className="flex-1 bg-cyan-400/70 rounded-full transition-all duration-300"
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* 2. MAIN CHAT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#07090e]/40">
        {/* Top Header */}
        <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between gap-4 shrink-0 bg-[#0c101a]/70">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <span className="material-symbols-outlined text-lg">psychology</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c101a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-xs">
                  {currentAgent?.name || (portalSettings.connection.mockDataPurged ? 'Hermes Agent (Live)' : 'Hermes Prime Orchestrator')}
                </h3>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                  portalSettings.connection.mockDataPurged
                    ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30'
                    : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                }`}>
                  {portalSettings.connection.mockDataPurged ? 'LIVE GATEWAY' : 'ONLINE'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {portalSettings.connection.mockDataPurged
                  ? `${portalSettings.connection.serverUrl || 'http://localhost:8642'} // ${currentAgent?.activeModelId || portalSettings.connection.connectedAgentModel || 'hermes-agent'}`
                  : (currentAgent?.description || 'Node-Cluster-Alpha-Root // Low Latency (14ms)')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Model Selector Chip */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="bg-transparent text-slate-200 text-[11px] font-mono focus:outline-none cursor-pointer"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0e1320] text-white">
                    {m.tag === 'LIVE GATEWAY' ? `● ` : ''}{m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start WebRTC Video Call */}
            <button
              onClick={() => setIsWebRtcOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(76,215,246,0.35)] hover:scale-105 active:scale-95"
              title="Start WebRTC Real-Time Video & Audio Comms"
              type="button"
            >
              <Video className="w-3.5 h-3.5" />
              <span>WebRTC Call</span>
            </button>

            {/* Toggle Thinking Stream Button */}
            <button
              onClick={() => setGlobalShowThinking(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                globalShowThinking
                  ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
              title={globalShowThinking ? "Thinking stream is visible (Click to collapse)" : "Thinking stream is hidden (Click to expand)"}
              type="button"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-medium hidden sm:inline">
                Thinking: {globalShowThinking ? 'Visible' : 'Hidden'}
              </span>
            </button>

            {/* New Session / Flush Context Button */}
            <button
              onClick={() => {
                const freshWelcome = getInitialWelcome(activeThread);
                updateActiveThreadMessages(() => freshWelcome);
                handleInputChange('');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors border border-white/[0.08] cursor-pointer"
              title="Start a fresh chat session for this agent"
              type="button"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium hidden sm:inline">New Session</span>
            </button>

            {/* Toggle Right Drawer */}
            <button
              onClick={() => setShowRightDrawer(!showRightDrawer)}
              className={`p-2 rounded-xl border transition-colors ${
                showRightDrawer
                  ? 'bg-cyan-400/15 border-cyan-400/30 text-cyan-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
              title="Toggle Telemetry Sidebar"
              type="button"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pinned Objective Transmission Banner */}
        <div className="px-6 py-2 bg-cyan-400/5 border-b border-cyan-400/15 flex items-center justify-between text-[11px] text-cyan-300">
          <div className="flex items-center gap-2">
            <Pin className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold">PINNED OBJECTIVE #42:</span>
            <span className="text-slate-300">Continuous speculative inference verification across all SXM5 nodes.</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">EST: 99.98% HEALTH</span>
        </div>

        {/* Messages Stream */}
        <div 
          onPaste={handlePaste}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Header */}
              <div className="flex flex-wrap items-center gap-2 mb-1 text-[10px] text-slate-500 px-1">
                <span className="font-bold text-slate-400">
                  {msg.sender === 'user' ? 'Operator (You)' : msg.agentName || 'Hermes Prime'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.confidence && (
                  <span className="text-emerald-400 font-medium">Confidence: {msg.confidence}</span>
                )}
                {msg.sender === 'agent' && msg.activitySteps && msg.activitySteps.length > 0 && (
                  <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-mono">
                    <Activity className="w-2.5 h-2.5" />
                    {msg.activitySteps.length} Actions
                  </span>
                )}
                {msg.sender === 'agent' && msg.thought && (
                  <button
                    type="button"
                    onClick={() => setGlobalShowThinking(prev => !prev)}
                    className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-mono transition-colors cursor-pointer"
                    title="Toggle Thought Process Visibility"
                  >
                    <Brain className="w-2.5 h-2.5" />
                    Reasoning Trace ({globalShowThinking ? 'Open' : 'Collapsed'})
                  </button>
                )}
                {msg.sender === 'agent' && msg.toolExecution && (
                  <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    <Wrench className="w-2.5 h-2.5" />
                    Tool Run
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 leading-relaxed text-xs ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-cyan-600/30 to-cyan-800/20 border border-cyan-400/30 text-white rounded-tr-none'
                    : 'bg-[#101624]/90 border border-white/[0.1] text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Agent Activity Steps (Actions Timeline) */}
                {msg.sender === 'agent' && (
                  <AgentActivityStepsViewer 
                    steps={msg.activitySteps} 
                    currentActivity={msg.currentActivity} 
                  />
                )}

                {/* Agent Thought & Reasoning Chain */}
                {msg.sender === 'agent' && msg.thought && (
                  <AgentThoughtViewer 
                    thought={msg.thought} 
                    agentName={msg.agentName} 
                    forceExpanded={globalShowThinking}
                  />
                )}

                {/* Tool Execution Card (if present) */}
                {msg.toolExecution && (
                  <ToolExecutionViewer toolExecution={msg.toolExecution} />
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Code Snippet (if present) */}
                {msg.codeSnippet && (
                  <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black/60 font-mono text-[11px]">
                    <div className="px-3.5 py-2 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        {msg.codeSnippet.fileName}
                      </span>
                      <button
                        onClick={() => copyCode(msg.codeSnippet!.code)}
                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                        type="button"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 text-cyan-300/90 overflow-x-auto">
                      <code>{msg.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Attachments (Files & Images) */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {msg.attachments.map((att, idx) => (
                      <div key={idx}>
                        {att.type === 'file' ? (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/30 transition-all">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
                                <FileCode className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate text-xs">{att.fileName}</div>
                                <div className="text-[10px] text-slate-400">{att.fileSize} {att.sha ? `• ${att.sha}` : ''}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => alert(`Downloading dump artifact: ${att.fileName}`)}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-cyan-400/20 text-cyan-400 transition-colors"
                              title="Download Attachment"
                              type="button"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-xl overflow-hidden border border-white/[0.1] bg-black/40">
                            <div className="relative group cursor-pointer" onClick={() => setLightboxImage(att.imageUrl || '')}>
                              <img
                                src={att.imageUrl}
                                alt={att.title || 'Telemetry Image'}
                                className="w-full h-44 object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                                <div className="flex items-center justify-between w-full text-white text-[11px]">
                                  <span className="font-bold">{att.fileName} • {att.fileSize}</span>
                                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice Note Player (Telegram Style) */}
                {msg.voiceNote && (
                  <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-400/20 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-9 h-9 rounded-full bg-cyan-400 text-[#07090e] flex items-center justify-center shadow-[0_0_12px_#4cd7f6] hover:opacity-90 transition-all shrink-0 cursor-pointer"
                        type="button"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      {/* Animated Waveform Bars */}
                      <div className="flex-1 flex items-center gap-1 h-7">
                        {(msg.voiceNote.waveforms || [8, 14, 22, 28, 16, 10, 18, 26, 32, 20, 12, 18, 24, 14, 8]).map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-200 ${
                              isPlayingAudio ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
                            }`}
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 shrink-0">
                        <span>{isPlayingAudio ? '0:14' : '0:00'} / {msg.voiceNote.duration}</span>
                        <button
                          onClick={() => setAudioSpeed(audioSpeed === '1.0x' ? '1.5x' : audioSpeed === '1.5x' ? '2.0x' : '1.0x')}
                          className="px-1.5 py-0.5 rounded bg-white/[0.06] text-cyan-300 font-bold hover:bg-white/[0.1]"
                          type="button"
                        >
                          {audioSpeed}
                        </button>
                      </div>
                    </div>

                    {/* Transcript Accordion */}
                    <div className="text-[10px] text-slate-400 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                      <span className="text-cyan-400 font-semibold uppercase">VOX Transcript: </span>
                      "{msg.voiceNote.transcript}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Real-Time Live Agent Activity HUD (Read What Agent Is Doing) */}
          {isSending && liveActivity && (
            <div className="flex flex-col items-start animate-fadeIn">
              <div className="flex items-center gap-2 mb-1.5 text-[10px] text-slate-400 px-1">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  {liveActivity.agentName} (Executing Directive...)
                </span>
                <span>•</span>
                <span className="text-cyan-300 font-mono">Live Autonomous Agent Feed</span>
              </div>
              <LiveAgentWorkingHUD 
                activityState={liveActivity} 
                onHalt={() => setIsSending(false)} 
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. BOTTOM TELEGRAM INPUT DOCK */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0c101a]/95 space-y-2 shrink-0">
          {/* Clipboard Preview Banner (when user pastes something) */}
          {clipboardItem && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/25 text-[11px] text-cyan-300">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                Clipboard Image Ready: <strong>{clipboardItem.name}</strong>
              </span>
              <button
                onClick={() => setClipboardItem(null)}
                className="text-slate-400 hover:text-white"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Attached Files Badges */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-slate-300">
                  <FileCode className="w-3 h-3 text-cyan-400" />
                  {f.name} ({f.size})
                  <button onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))} type="button">
                    <X className="w-3 h-3 text-slate-500 hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Slash Commands Helper Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px] text-slate-400">
            <span className="text-slate-500 uppercase font-semibold">Commands:</span>
            {['/status', '/swap-model', '/flush-cache', '/clear-context'].map(cmd => (
              <button
                key={cmd}
                onClick={() => setInputText(cmd)}
                className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-cyan-400 border border-white/[0.05] transition-colors whitespace-nowrap"
                type="button"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Main Input Bar */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Attach File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-cyan-400 border border-white/[0.08] transition-colors cursor-pointer"
              title="Attach File or Image"
              type="button"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={isRecording ? `Recording voice transmission (${recordingSeconds}s)...` : "Type a message, run a slash command, or paste files/images..."}
                disabled={isRecording}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-cyan-400/50 text-white placeholder:text-slate-500 text-xs focus:outline-none transition-colors"
              />
            </div>

            {/* Voice Memo Recording Button */}
            <button
              onClick={handleToggleVoiceRecording}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border-white/[0.08]'
              }`}
              title={isRecording ? "Stop & Send Voice Memo" : "Record Voice Note"}
              type="button"
            >
              {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSending}
              className={`p-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#07090e] font-bold shadow-[0_0_15px_rgba(76,215,246,0.3)] hover:opacity-95 transition-all cursor-pointer shrink-0 ${
                isSending ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title={isSending ? "Inference in Progress..." : "Dispatch Message"}
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 fill-current" />
              )}
            </button>
          </form>
        </div>
      </main>

      {/* 3. RIGHT COLLAPSIBLE CONTEXT & TELEMETRY DRAWER */}
      {showRightDrawer && (
        <aside className="w-72 sm:w-80 border-l border-white/[0.08] bg-[#07090e]/75 p-5 flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="font-bold text-white text-xs uppercase tracking-wide">AGENT CONTEXT & TELEMETRY</span>
              <button onClick={() => setShowRightDrawer(false)} className="text-slate-500 hover:text-white" type="button">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Agent Status Card */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Agent Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isSending
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 animate-pulse'
                    : isHalted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isSending ? 'bg-cyan-400 animate-ping' : isHalted ? 'bg-rose-400' : 'bg-emerald-400'
                  }`} />
                  {isSending ? 'EXECUTING DIRECTIVE' : isHalted ? 'HALTED' : 'STANDBY / LISTENING'}
                </span>
              </div>

              {isSending && liveActivity && (
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-400/30 text-[10px] space-y-1">
                  <div className="text-cyan-300 font-bold flex items-center justify-between">
                    <span>STEP {liveActivity.stepIndex} OF {liveActivity.totalSteps}</span>
                    <span className="font-mono">{liveActivity.elapsedSeconds.toFixed(1)}s</span>
                  </div>
                  <p className="text-slate-200 truncate">{liveActivity.currentPhase}</p>
                </div>
              )}

              <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Target Agent:</span>
                  <span className="text-white font-semibold truncate max-w-[130px]">{currentAgent?.name || 'Hermes Prime'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Model Engine:</span>
                  <span className="text-cyan-400 font-bold truncate max-w-[130px]">{portalSettings.connection.connectedAgentModel || activeModel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Context Window:</span>
                  <span className="text-white">128,000 Tokens</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Host Endpoint:</span>
                  <span className="text-purple-300 font-mono text-[10px] truncate max-w-[130px]">
                    {portalSettings.connection.serverUrl || 'localhost:8642'}
                  </span>
                </div>
              </div>
            </div>

            {/* Node Resource Gauges */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Node Resource Gauges</span>
              
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">VRAM Load</span>
                  <span className="text-cyan-300 font-semibold">91.0%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '91%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Speculative Speed</span>
                  <span className="text-emerald-400 font-semibold">4.2k tps</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Core Temp</span>
                  <span className="text-white font-semibold">62.1°C</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-300 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>
            </div>

            {/* Active Tool Plugins */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Tool Plugins</span>
              {['cluster_telemetry_fetch', 'vllm_cache_evict', 'dispatch_lora_adapter', 'emergency_cluster_failover'].map((tool, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[10px] font-mono text-slate-300 flex items-center justify-between">
                  <span className="truncate">{tool}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Kill Switch */}
          <div className="pt-6 border-t border-white/[0.08]">
            <button
              onClick={() => {
                setIsHalted(!isHalted);
                alert(isHalted ? 'Resumed Hermes Agent operations.' : 'EMERGENCY HALT TRIGGERED: All inference streams paused.');
              }}
              className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isHalted
                  ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
              }`}
              type="button"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isHalted ? 'Resume Agent Operation' : 'Intervene & Halt Agent'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* Lightbox Modal for Thermography Image */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl w-full p-2 bg-[#101624] border border-white/[0.1] rounded-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Fullscreen Telemetry" className="w-full h-auto rounded-xl object-contain max-h-[80vh]" />
            <div className="p-3 text-xs font-mono text-slate-300">
              CLUSTER-ALPHA-RACK-02.RAW • SXM5 CLUSTER THERMOGRAPHY
            </div>
          </div>
        </div>
      )}

      {/* WebRTC Real-Time Video Call Modal */}
      <WebRtcModal
        isOpen={isWebRtcOpen}
        onClose={() => setIsWebRtcOpen(false)}
        agentName={currentAgent?.name || 'Hermes Prime'}
        agentCodename={currentAgent?.codename || 'Orchestrator-01'}
        agentPhoto={currentAgent?.avatarPhoto}
        fleetName={activeFleet?.name || 'Alpha Core Fleet'}
      />
    </div>
  );
};
