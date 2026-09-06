import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Check, Copy } from 'lucide-react';

interface ToolExecutionViewerProps {
  toolExecution: {
    toolName: string;
    status: string;
    execTime: string;
    payloadSize: string;
    callId: string;
    inputArgs?: string;
    outputResult?: string;
  };
}

export const ToolExecutionViewer: React.FC<ToolExecutionViewerProps> = ({ toolExecution }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = JSON.stringify({
      tool: toolExecution.toolName,
      status: toolExecution.status,
      execTime: toolExecution.execTime,
      callId: toolExecution.callId,
      input: toolExecution.inputArgs,
      output: toolExecution.outputResult
    }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasPayload = Boolean(toolExecution.inputArgs || toolExecution.outputResult);

  return (
    <div className="rounded-xl bg-black/40 border border-white/[0.08] text-[11px] font-mono overflow-hidden transition-all">
      {/* Tool Header Bar */}
      <div 
        onClick={() => hasPayload && setIsExpanded(!isExpanded)}
        className={`p-3 flex items-center justify-between gap-3 text-cyan-400 font-semibold ${
          hasPayload ? 'cursor-pointer hover:bg-white/[0.02]' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">TOOL EXEC: {toolExecution.toolName}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
            {toolExecution.status}
          </span>
          {hasPayload && (
            <div className="text-slate-400 hover:text-white">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="px-3 pb-2.5 flex items-center justify-between text-slate-400 text-[10px] border-b border-white/[0.04]">
        <span>EXEC TIME: {toolExecution.execTime}</span>
        <span>PAYLOAD: {toolExecution.payloadSize}</span>
        <span>CALL: {toolExecution.callId}</span>
      </div>

      {/* Expandable Inputs and Outputs */}
      {hasPayload && isExpanded && (
        <div className="p-3 space-y-2.5 bg-black/60 border-t border-white/[0.06] text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 uppercase font-semibold">Daemon I/O Payload Inspection</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {toolExecution.inputArgs && (
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold text-[9px] uppercase">Arguments & Parameters:</div>
              <pre className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-tight">
                <code>{toolExecution.inputArgs}</code>
              </pre>
            </div>
          )}

          {toolExecution.outputResult && (
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold text-[9px] uppercase">Return Output:</div>
              <pre className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-emerald-300/90 overflow-x-auto whitespace-pre-wrap leading-tight">
                <code>{toolExecution.outputResult}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
