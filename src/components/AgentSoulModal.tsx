import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { getAgentSoul, DEFAULT_SOUL_PROMPTS } from '../data/agentMemorySoulData';
import { 
  X, 
  Save, 
  RotateCcw, 
  FileCode, 
  Eye, 
  Columns, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface AgentSoulModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentId: string, newSoul: string) => void;
}

export const AgentSoulModal: React.FC<AgentSoulModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen || !agent) return null;

  const initialSoul = getAgentSoul(agent.id, agent.soulPrompt);
  const [content, setContent] = useState<string>(initialSoul);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    const current = getAgentSoul(agent.id, agent.soulPrompt);
    setContent(current);
    setIsSaved(true);
    setShowResetConfirm(false);
  }, [agent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave(agent.id, content);
    setIsSaved(true);
  };

  const handleReset = () => {
    const defaultSoul = DEFAULT_SOUL_PROMPTS[agent.id] || `# ${agent.name.toUpperCase()} // SOUL MANIFESTO\n## IDENTITY\nAutonomous agent.`;
    setContent(defaultSoul);
    setIsSaved(false);
    setShowResetConfirm(false);
  };

  const insertSnippet = (snippet: string) => {
    setContent(prev => `${prev}\n\n${snippet}`);
    setIsSaved(false);
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, agent]);

  // Statistics calculation
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content.split('\n').length;
  const estimatedTokens = Math.round(charCount / 3.8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0c101a] border border-white/[0.14] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] font-mono text-xs max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0e1422]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(76,215,246,0.2)]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-tight">
                  SOUL.MD EDITOR // {agent.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-semibold">
                  {agent.codename}
                </span>
                {isSaved ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                    SYNCED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    UNSAVED EDITS
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-normal mt-0.5 flex items-center gap-2">
                <span className="text-slate-300 font-mono">/hermes/agents/{agent.id}/soul.md</span>
                <span>•</span>
                <span>Active Inference Model: {agent.activeModelId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'editor'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Edit Markdown text"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'preview'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View Rendered Markdown"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`hidden md:flex px-3 py-1 rounded-lg text-[11px] font-medium transition-all items-center gap-1.5 ${
                  viewMode === 'split'
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Side by side split view"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              type="button"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Insert Actions Toolbar */}
        <div className="px-6 py-2 bg-[#090d16] border-b border-white/[0.06] flex items-center justify-between gap-3 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Insert Directives:</span>
            <button
              type="button"
              onClick={() => insertSnippet('### PRIORITY DIRECTIVE\n- Always cross-validate mathematical computations against python sandbox before responding.')}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/[0.06] text-slate-300 transition-colors"
            >
              + Sandbox Math Rule
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('### SAFETY & GUARDRAIL\n- Under no circumstances execute destructive file deletion or network flood attacks.')}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/[0.06] text-slate-300 transition-colors"
            >
              + Safety Guardrail
            </button>
            <button
              type="button"
              onClick={() => insertSnippet('### OUTPUT FORMATTING\n- Respond exclusively in structured markdown with executable code blocks and strict typings.')}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/[0.06] text-slate-300 transition-colors"
            >
              + Markdown Format
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showResetConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-lg">
                <span className="text-rose-300 text-[10px]">Reset to factory default?</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-bold hover:bg-rose-600 transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[10px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/[0.06] transition-colors"
                title="Restore default soul.md prompt"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full flex gap-4">
            {/* Markdown Textarea Editor */}
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div className="flex-1 flex flex-col h-full bg-[#080b12] rounded-xl border border-white/[0.08] overflow-hidden focus-within:border-cyan-400/50 transition-colors">
                <div className="px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                    <FileCode className="w-3.5 h-3.5" />
                    SOUL.MD SOURCE
                  </span>
                  <span className="text-[10px] text-slate-500">Markdown syntax supported • Press Ctrl+S to save</span>
                </div>
                <textarea
                  value={content}
                  onChange={handleChange}
                  placeholder="# Enter agent soul directives, identity, and behavior guidelines..."
                  className="flex-1 w-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/30 selection:text-cyan-200 overflow-y-auto"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Markdown Live Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="flex-1 flex flex-col h-full bg-[#080b12] rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <Eye className="w-3.5 h-3.5" />
                    RENDERED SYSTEM PROMPT
                  </span>
                  <span className="text-[10px] text-slate-500">Live Cognitive View</span>
                </div>
                <div className="flex-1 p-5 overflow-y-auto font-sans text-xs text-slate-200 leading-relaxed space-y-4">
                  {content.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-base font-bold text-white border-b border-white/[0.08] pb-1.5 mt-2 text-cyan-300 font-mono">{line.replace('# ', '')}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-sm font-bold text-white border-b border-white/[0.04] pb-1 mt-3 text-cyan-400 font-mono">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-xs font-bold text-slate-200 mt-2 font-mono">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <li key={idx} className="ml-4 list-disc text-slate-300 font-normal">
                          {line.replace(/^[-*]\s+/, '')}
                        </li>
                      );
                    }
                    if (/^\d+\.\s/.test(line)) {
                      return (
                        <li key={idx} className="ml-4 list-decimal text-slate-300 font-normal">
                          {line.replace(/^\d+\.\s+/, '')}
                        </li>
                      );
                    }
                    if (line.trim() === '') {
                      return <div key={idx} className="h-1.5" />;
                    }
                    return <p key={idx} className="text-slate-300">{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Statistics & Save Action */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-[#0e1422]/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div>
              <span className="text-slate-500">Characters:</span> <span className="text-white font-semibold">{charCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500">Words:</span> <span className="text-white font-semibold">{wordCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500">Lines:</span> <span className="text-white font-semibold">{lineCount}</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 font-semibold">
              ≈ {estimatedTokens.toLocaleString()} Prompt Tokens
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(76,215,246,0.3)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Deploy SOUL.md</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
