import React, { useState, useEffect } from 'react';
import { Brain, ChevronDown, ChevronUp, Copy, Check, Sparkles, Terminal, ListOrdered } from 'lucide-react';

interface AgentThoughtViewerProps {
  thought: string;
  defaultExpanded?: boolean;
  forceExpanded?: boolean;
  agentName?: string;
  elapsedSeconds?: number;
}

export const AgentThoughtViewer: React.FC<AgentThoughtViewerProps> = ({
  thought,
  defaultExpanded = true,
  forceExpanded,
  agentName = 'Hermes Agent',
  elapsedSeconds
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');

  useEffect(() => {
    if (forceExpanded !== undefined) {
      setIsExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  if (!thought || !thought.trim()) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(thought);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawLines = thought.split('\n').filter(line => line.trim().length > 0);
  const stepCount = rawLines.length;

  return (
    <div className="w-full rounded-xl border border-purple-500/35 bg-gradient-to-br from-[#150e29]/95 via-[#0e0c1f]/95 to-[#080a12]/95 overflow-hidden transition-all shadow-[0_0_20px_rgba(168,85,247,0.12)]">
      {/* Reasoning Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.04] transition-colors cursor-pointer border-b border-purple-500/20"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
            <Brain className="w-4 h-4 text-purple-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-purple-200 tracking-wide flex items-center gap-1.5">
                Thought Process
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-medium">
                {stepCount} reasoning {stepCount === 1 ? 'line' : 'lines'}
              </span>
              {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300/80 border border-purple-500/30 font-mono">
                  {elapsedSeconds.toFixed(1)}s think time
                </span>
              )}
            </div>
            <p className="text-[10px] text-purple-300/80 truncate">
              {isExpanded ? 'Internal speculative reasoning & cognitive plan' : 'Click to inspect how the agent planned and deduced this response'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isExpanded && (
            <div className="flex items-center bg-black/40 border border-purple-500/30 rounded-lg p-0.5 text-[9px] font-mono mr-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('structured');
                }}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  viewMode === 'structured' ? 'bg-purple-500/30 text-purple-200 font-semibold' : 'text-purple-400/70 hover:text-purple-200'
                }`}
                title="Structured View"
              >
                <ListOrdered className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('raw');
                }}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  viewMode === 'raw' ? 'bg-purple-500/30 text-purple-200 font-semibold' : 'text-purple-400/70 hover:text-purple-200'
                }`}
                title="Raw Stream View"
              >
                <Terminal className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-purple-500/20 text-purple-300/80 hover:text-purple-200 transition-colors"
            title="Copy Thought Trace"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          <button
            type="button"
            className="p-1 rounded-md text-purple-300 hover:text-white"
            aria-label={isExpanded ? 'Collapse thinking' : 'Expand thinking'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Reasoning Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-2.5 bg-black/50">
          <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Reasoning Engine: {agentName}
            </span>
            <span className="text-purple-400/70 tracking-wider">SPECULATIVE REASONING KERNEL</span>
          </div>

          {viewMode === 'structured' ? (
            <div className="space-y-1.5 font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto pr-1">
              {rawLines.map((line, idx) => {
                const isStepHeader = /^(\d+\.|\*|-|•|\[Step)/i.test(line.trim());
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg transition-all ${
                      isStepHeader
                        ? 'bg-purple-950/40 border border-purple-500/30 text-purple-100 font-semibold pl-2.5'
                        : 'bg-black/30 text-purple-200/90 pl-3 border-l-2 border-purple-500/30'
                    }`}
                  >
                    <span className="whitespace-pre-wrap">{line}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-black/70 border border-purple-500/25 font-mono text-[11px] text-purple-200/95 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto selection:bg-purple-500/40">
              {thought}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
