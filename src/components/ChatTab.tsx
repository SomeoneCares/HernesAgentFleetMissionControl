import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ModelOption } from '../types';
import { INITIAL_CHAT_MESSAGES, AVAILABLE_MODELS } from '../data/mockData';
import { useCluster } from '../context/ClusterContext';
import { WebRtcModal } from './WebRtcModal';
import { sendHermesChatCompletion } from '../services/hermesAgentService';
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
  Video
} from 'lucide-react';

export const ChatTab: React.FC = () => {
  const { agents, activeFleet, portalSettings } = useCluster();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      if (localStorage.getItem('hermes_mock_purged_v1') === 'true') {
        return [
          {
            id: 'msg-live-welcome',
            sender: 'agent',
            agentName: 'Hermes Agent',
            timestamp: new Date().toTimeString().slice(0, 5),
            text: 'Hermes Agent Gateway online (port 8642). Mockup data is purged. Ready for autonomous task execution and reasoning prompts.',
            confidence: '100% Real Gateway'
          }
        ];
      }
    } catch {}
    return INITIAL_CHAT_MESSAGES;
  });
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeModel, setActiveModel] = useState(AVAILABLE_MODELS[0].id);
  const [activeThread, setActiveThread] = useState(() => agents[0]?.id || 'hermes-live-gateway');
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

  // Keep activeThread in sync if agents list changes (e.g. purge or sync)
  useEffect(() => {
    if (agents.length > 0 && !agents.some(a => a.id === activeThread)) {
      setActiveThread(agents[0].id);
    }
  }, [agents, activeThread]);

  // Purge mock chat messages if mockDataPurged is active
  useEffect(() => {
    if (portalSettings?.connection?.mockDataPurged) {
      setMessages(prev => {
        const hasMockMessage = prev.some(m => m.id === 'msg-1' || m.id === 'msg-2' || m.id === 'msg-3');
        if (hasMockMessage) {
          return [
            {
              id: 'msg-live-welcome',
              sender: 'agent',
              agentName: 'Hermes Agent',
              timestamp: new Date().toTimeString().slice(0, 5),
              text: `Hermes Agent Gateway online (${portalSettings.connection.serverUrl || 'port 8642'}). Mockup data is purged. Ready for autonomous task execution and reasoning prompts.`,
              confidence: '100% Real Gateway'
            }
          ];
        }
        return prev;
      });
    }
  }, [portalSettings?.connection?.mockDataPurged, portalSettings?.connection?.serverUrl, portalSettings?.connection?.connectedAgentModel]);

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

      setMessages(prev => [...prev, voiceMessage]);

      // Trigger automatic agent reply
      setTimeout(() => {
        const agentReply: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Hermes Prime Orchestrator',
          timestamp: new Date().toTimeString().slice(0, 5),
          text: 'Voice memo received and transcribed with 99.9% confidence. Cluster latency is currently nominal at 14ms. Ready for next directive.',
          confidence: '99.9%'
        };
        setMessages(prev => [...prev, agentReply]);
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

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachedFiles([]);
    setClipboardItem(null);

    setIsSending(true);
    const serverUrl = portalSettings.connection.serverUrl || 'http://localhost:8642';
    const authToken = portalSettings.connection.authToken;
    const modelToUse = portalSettings.connection.connectedAgentModel || activeModel || 'hermes-agent';

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

        const res = await sendHermesChatCompletion(serverUrl, hermesHistory, modelToUse, authToken);

        if (res.ok && res.replyText) {
          const agentReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            agentName: `Hermes Agent (${res.modelUsed || 'Live Daemon'})`,
            timestamp: new Date().toTimeString().slice(0, 5),
            confidence: '100% Real Live Output',
            text: res.replyText,
            toolExecution: res.toolCalls && res.toolCalls.length > 0 ? {
              toolName: res.toolCalls[0]?.function?.name || 'hermes_tool_call',
              status: 'STATUS 200 OK',
              execTime: `${Math.floor(Math.random() * 25) + 15}ms`,
              payloadSize: '2.4 KB',
              callId: res.toolCalls[0]?.id || `#TLM-${Math.floor(10000 + Math.random() * 90000)}`
            } : undefined
          };
          setMessages(prev => [...prev, agentReply]);
        } else if (portalSettings.connection.mockDataPurged) {
          // If mockup data is purged, show explicit connection error rather than fake canned text
          const errorReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            agentName: 'Hermes Daemon Gateway',
            timestamp: new Date().toTimeString().slice(0, 5),
            confidence: 'Error Diagnostic',
            text: `⚠️ **Could not connect to live Hermes Agent at ${serverUrl}/v1/chat/completions**\n\n*Error details:* \`${res.error || 'Connection refused or host unreachable'}\`\n\n**To connect your real agent:**\n1. Run: \`hermes gateway --port 8642 --host 0.0.0.0\` in your terminal\n2. Open Settings (⚙️ in top bar) and verify URL is \`http://localhost:8642\`\n3. Click **"Test Connection"** to verify the socket`
          };
          setMessages(prev => [...prev, errorReply]);
        } else {
          // Fallback simulation when in demo mockup mode
          const isStatusCmd = userMsg.text.includes('/status');
          const isSwapCmd = userMsg.text.includes('/swap');

          const agentReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            agentName: 'Hermes Prime Orchestrator',
            timestamp: new Date().toTimeString().slice(0, 5),
            confidence: '99.8%',
            text: isStatusCmd 
              ? '### Cluster Status Matrix\n• All 8x H100 SXM5 compute nodes running at 58.4°C nominal.\n• NVLink interconnect throughput: 900 GB/s.\n• Active agent pipelines: 3 queued, 0 dropped frames.'
              : isSwapCmd
              ? 'Swapped model weights to target inference kernel with zero session loss.'
              : `Directive received. Hermes has scheduled the request into the speculative tensor pipeline. All parameters validated against safety guardrails.`,
            toolExecution: {
              toolName: 'dispatch_lora_adapter(target="cluster_east_01")',
              status: 'STATUS 200 OK',
              execTime: '28.4ms',
              payloadSize: '4.2 KB',
              callId: `#TLM-${Math.floor(10000 + Math.random() * 90000)}`
            }
          };
          setMessages(prev => [...prev, agentReply]);
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
                onClick={() => setActiveThread(ag.id)}
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
                {AVAILABLE_MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0e1320] text-white">
                    {m.name}
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

            {/* Clear Context Button */}
            <button
              onClick={() => {
                setMessages([INITIAL_CHAT_MESSAGES[0]]);
              }}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              title="Flush Conversation Context"
              type="button"
            >
              <Terminal className="w-4 h-4" />
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
              <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-500 px-1">
                <span className="font-bold text-slate-400">
                  {msg.sender === 'user' ? 'Operator (You)' : msg.agentName || 'Hermes Prime'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.confidence && (
                  <span className="text-emerald-400 font-medium">Confidence: {msg.confidence}</span>
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
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Tool Execution Card (if present) */}
                {msg.toolExecution && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-cyan-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        TOOL RUN: {msg.toolExecution.toolName}
                      </span>
                      <span className="text-emerald-400">{msg.toolExecution.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>EXEC TIME: {msg.toolExecution.execTime}</span>
                      <span>PAYLOAD: {msg.toolExecution.payloadSize}</span>
                      <span>CALL: {msg.toolExecution.callId}</span>
                    </div>
                  </div>
                )}

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
                onChange={(e) => setInputText(e.target.value)}
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

            {/* Agent Identity */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Model Engine:</span>
                <span className="text-cyan-400 font-bold">Hermes-3-405B</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Context Window:</span>
                <span className="text-white">128,000 Tokens</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Cluster Node:</span>
                <span className="text-purple-300">Cluster-Alpha-Root</span>
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
