import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Loader2, 
  Terminal, 
  AlertCircle,
  Brain,
  Sparkles
} from 'lucide-react';
import { AgentActivityStep } from '../types';

export interface LiveAgentActivityState {
  currentPhase: string;
  stepIndex: number;
  totalSteps: number;
  steps: { label: string; status: 'completed' | 'running' | 'pending'; detail?: string }[];
  elapsedSeconds: number;
  model: string;
  agentName: string;
  liveLogs: string[];
  liveThoughts?: string[];
}

interface LiveAgentWorkingHUDProps {
  activityState: LiveAgentActivityState;
  onHalt?: () => void;
}

export const LiveAgentWorkingHUD: React.FC<LiveAgentWorkingHUDProps> = ({
  activityState,
  onHalt
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [showThinking, setShowThinking] = useState(true);

  return (
    <div className="w-full max-w-2xl rounded-2xl p-4 sm:p-5 bg-[#0e1422]/95 border border-cyan-400/40 shadow-[0_0_25px_rgba(76,215,246,0.15)] text-xs font-mono space-y-3.5 animate-fadeIn">
      {/* Top Banner: Agent Name & Live Status */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs tracking-wide">
                {activityState.agentName}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 text-[9px] font-bold uppercase tracking-wider">
                {activityState.model}
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80 font-normal">
              Autonomous execution loop active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[10px]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="font-mono text-white font-semibold">
              {activityState.elapsedSeconds.toFixed(1)}s
            </span>
          </div>
          {onHalt && (
            <button
              type="button"
              onClick={onHalt}
              className="px-2 py-1 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[10px] font-semibold transition-colors cursor-pointer"
            >
              Halt
            </button>
          )}
        </div>
      </div>

      {/* Main Real-Time Action Indicator */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-400/20">
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-white font-bold tracking-wide flex items-center gap-1.5">
              CURRENT ACTIVITY:
            </span>
            <span className="text-cyan-300 font-bold">
              STEP {activityState.stepIndex} OF {activityState.totalSteps}
            </span>
          </div>
          <p className="text-cyan-200 text-xs font-semibold leading-snug">
            {activityState.currentPhase}
          </p>
        </div>
      </div>

      {/* Live Thinking Stream (Real-Time Cognitive Trace) */}
      {activityState.liveThoughts && activityState.liveThoughts.length > 0 && (
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-[#170e2c]/90 via-[#0e0c1f]/95 to-black/90 p-3 space-y-2 shadow-md">
          <div 
            onClick={() => setShowThinking(!showThinking)}
            className="flex items-center justify-between cursor-pointer text-purple-300 text-[11px]"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="font-bold text-purple-200">
                Live Thinking Process ({activityState.liveThoughts.length} reasoning steps)
              </span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-purple-400/80">
              <span>{showThinking ? 'Hide' : 'Show'}</span>
              {showThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </div>

          {showThinking && (
            <div className="space-y-1 pt-1 font-mono text-[10px] text-purple-200/90 max-h-40 overflow-y-auto">
              {activityState.liveThoughts.map((thought, idx) => (
                <div key={idx} className="p-1.5 rounded bg-black/40 border border-purple-500/20 flex items-start gap-2 leading-relaxed">
                  <span className="text-purple-400 font-bold shrink-0">&gt;</span>
                  <span className="flex-1">{thought}</span>
                </div>
              ))}
              <div className="flex items-center gap-1 text-purple-400 text-[10px] pl-1 pt-0.5 animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Formulating next reasoning tokens... ▌</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step Progression Timeline */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          Reasoning & Execution Pipeline
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {activityState.steps.map((step, idx) => {
            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'running';

            return (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-[10px] flex items-center gap-2 transition-all ${
                  isCurrent
                    ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-200 font-semibold'
                    : isDone
                    ? 'bg-white/[0.02] border-emerald-500/30 text-slate-300'
                    : 'bg-white/[0.01] border-white/[0.04] text-slate-500'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[8px] text-slate-500">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <span className="truncate">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Daemon Logs Accordion */}
      {activityState.liveLogs.length > 0 && (
        <div className="border-t border-white/[0.06] pt-2">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between text-[10px] text-slate-400 hover:text-cyan-300 py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Terminal className="w-3 h-3 text-cyan-400" />
              Live Daemon Telemetry Logs ({activityState.liveLogs.length} events)
            </span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <div className="mt-1.5 p-2.5 rounded-lg bg-black/60 border border-white/[0.08] text-[10px] text-cyan-300/80 font-mono space-y-1 max-h-36 overflow-y-auto">
              {activityState.liveLogs.map((log, i) => (
                <div key={i} className="leading-tight flex items-start gap-1.5">
                  <span className="text-slate-500 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AgentActivityStepsViewerProps {
  steps?: AgentActivityStep[];
  currentActivity?: string;
  defaultExpanded?: boolean;
}

export const AgentActivityStepsViewer: React.FC<AgentActivityStepsViewerProps> = ({
  steps,
  currentActivity,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!steps || steps.length === 0) {
    if (!currentActivity) return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono text-slate-400">
        <Activity className="w-3 h-3 text-cyan-400" />
        <span>Action: {currentActivity}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 overflow-hidden font-mono text-[11px] transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-white/[0.02] cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">
            Agent Execution Steps
          </span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 text-[9px]">
            {steps.length} completed
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span>{isExpanded ? 'Hide Steps' : 'Read What Agent Did'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-white/[0.06] space-y-2 bg-black/40">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start gap-2.5 text-[10px]">
              <div className="mt-0.5 shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : step.status === 'failed' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-cyan-400 text-cyan-400 flex items-center justify-center text-[8px]">
                    {step.step}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{step.label}</span>
                  {step.timestamp && (
                    <span className="text-slate-500 font-mono text-[9px]">{step.timestamp}</span>
                  )}
                </div>
                {step.detail && (
                  <p className="text-slate-400 text-[9px] font-mono mt-0.5 truncate bg-black/50 px-1.5 py-0.5 rounded border border-white/[0.04]">
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
