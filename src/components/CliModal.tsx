import React, { useState } from 'react';
import { X, Terminal, CornerDownLeft, Trash2 } from 'lucide-react';

interface CliModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CliModal: React.FC<CliModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'Hermes Mission Control Cluster Shell v4.2 [x86_64-linux-gnu]',
    'Connected to US-EAST-CORE-01 via secure mTLS tunnel.',
    'Type "help", "status", "agents", "clear", or "scale <node>" for commands.',
    ''
  ]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    const lower = cmd.toLowerCase();
    const newHistory = [...history, `root@hermes-core:~$ ${cmd}`];

    if (lower === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (lower === 'help') {
      newHistory.push(
        'Available commands:',
        '  status        - Show cluster hardware and gateway metrics',
        '  agents        - List all autonomous agents and allocated models',
        '  balance       - Trigger auto-rebalancing across GPU nodes',
        '  flush-cache   - Purge paged KV attention cache blocks',
        '  ping          - Probe latency to cluster interconnects',
        '  clear         - Clear terminal output'
      );
    } else if (lower === 'status') {
      newHistory.push(
        'CLUSTER STATUS: 8x H100 SXM5 OPTIMAL',
        '  VRAM Allocated: 582.4 GB / 640.0 GB (91.0%)',
        '  Gateway Throughput: 4,210 tps (HTTP/3 Active)',
        '  SLA: 99.98% Healthy | Uptime: 42d 18h'
      );
    } else if (lower === 'agents') {
      newHistory.push(
        'ACTIVE FLEET WORKERS (06):',
        '  [1] Hermes Prime       :: Hermes 3 405B Instruct  :: 18ms (38%)',
        '  [2] CodeSynthesizer    :: Qwen 2.5 Coder 32B      :: 24ms (29%)',
        '  [3] ResearchOracle     :: Hermes 3 70B FP8        :: 16ms (18%)',
        '  [4] OpsSentry          :: Hermes 2 Pro 70B        :: 9ms  (15%)',
        '  [5] DataWeaver         :: Hermes 3 70B FP8        :: 16ms (12%)',
        '  [6] SecuritySentinel   :: Hermes 2 Pro 8B Guard   :: 4ms  (8%)'
      );
    } else if (lower === 'balance') {
      newHistory.push(
        'RE-BALANCING TRIGGERED:',
        '  Iterating tensor pipelines... load distributed equally across worker pods.'
      );
    } else if (lower === 'flush-cache') {
      newHistory.push(
        'CACHE FLUSH SUCCESS:',
        '  Purged 24,192 ephemeral KV blocks. Headroom restored.'
      );
    } else if (lower === 'ping') {
      newHistory.push(
        'PING us-east-01.hermes.cluster.internal (10.0.1.4): 56 data bytes',
        '64 bytes from 10.0.1.4: icmp_seq=1 ttl=64 time=0.384 ms',
        '64 bytes from 10.0.1.4: icmp_seq=2 ttl=64 time=0.412 ms',
        '--- 0.0% packet loss, rtt min/avg/max = 0.384/0.398/0.412 ms ---'
      );
    } else {
      newHistory.push(`hermes: command not found: ${cmd}. Type "help" for list.`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090d16] border border-cyan-400/30 p-6 shadow-[0_0_50px_rgba(76,215,246,0.15)] font-mono text-xs flex flex-col h-[520px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold text-xs tracking-wide">HERMES DIRECT CONTROL CLI // TTY-1</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistory([])}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Clear terminal"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-2">
          {history.map((line, idx) => (
            <div key={idx} className={line.startsWith('root@') ? 'text-cyan-400 font-semibold' : line.includes('OPTIMAL') || line.includes('SUCCESS') ? 'text-emerald-400' : ''}>
              {line}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleCommand} className="pt-3 border-t border-white/[0.08] flex items-center gap-2 shrink-0">
          <span className="text-cyan-400 font-bold">root@hermes-core:~$</span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
            placeholder="enter command (type 'help')..."
          />
          <button type="submit" className="text-slate-400 hover:text-cyan-400">
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
