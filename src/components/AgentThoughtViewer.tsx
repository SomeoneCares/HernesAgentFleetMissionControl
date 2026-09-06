import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react';

interface AgentThoughtViewerProps {
  thought: string;
  defaultExpanded?: boolean;
  agentName?: string;
}

export const AgentThoughtViewer: React.FC<AgentThoughtViewerProps> = ({
  thought,
  defaultExpanded = false,
  agentName = 'Hermes Agent'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  if (!thought || !thought.trim()) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(thought);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Count lines or reasoning steps
  const stepCount = thought.split('\n').filter(line => line.trim().length > 0).length;

  return (
    <div className="rounded-xl border border-purple-500/25 bg-gradient-to-br from-[#120d24]/90 via-[#0c0a1a]/95 to-[#07090e]/95 overflow-hidden transition-all shadow-lg">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-purple-200 tracking-wide">
                Agent Thought & Reasoning Chain
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                {stepCount} lines
              </span>
            </div>
            <p className="text-[10px] text-purple-300/70 truncate">
              {isExpanded ? 'Internal reasoning and decision path' : 'Click to inspect how the agent planned and deduced this response'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-purple-500/20 text-purple-300/80 hover:text-purple-200 transition-colors"
            title="Copy Thought Trace"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <div className="text-purple-300/70">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Reasoning Body */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-purple-500/15 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-purple-400/80 font-mono pt-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Reasoning Engine: {agentName}
            </span>
            <span>SPECULATIVE REASONING KERNEL</span>
          </div>

          <div className="p-3 rounded-lg bg-black/50 border border-purple-500/20 font-mono text-[11px] text-purple-200/90 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto selection:bg-purple-500/30">
            {thought}
          </div>
        </div>
      )}
    </div>
  );
};
