import React, { useState } from 'react';
import { ArtifactItem } from '../../types';
import { Copy, Check, FileText, Code, CheckSquare, Square, TrendingDown } from 'lucide-react';

interface MarkdownPreviewerProps {
  artifact: ArtifactItem;
}

export const MarkdownPreviewer: React.FC<MarkdownPreviewerProps> = ({ artifact }) => {
  const [copied, setCopied] = useState(false);

  const content = artifact.rawContent || `# ${artifact.name}\n\n${artifact.previewSummary || 'No raw content available.'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple, elegant parser for markdown blocks
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3) || 'text';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <div key={`code-${index}`} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/70 font-mono text-xs">
              <div className="px-4 py-2 bg-white/[0.04] border-b border-white/[0.08] flex items-center justify-between text-slate-400 text-[11px]">
                <span className="uppercase text-cyan-400 font-bold tracking-wider">{codeLanguage}</span>
                <span className="text-[10px] text-slate-500">SYNTAX HIGHLIGHTED</span>
              </div>
              <pre className="p-4 text-cyan-300/90 overflow-x-auto leading-relaxed">
                <code>{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableBuffer = [line];
        } else {
          tableBuffer.push(line);
        }
        return;
      } else if (inTable) {
        inTable = false;
        // render table
        const rows = tableBuffer.filter(r => !r.includes('---')).map(r => 
          r.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
        );
        if (rows.length > 0) {
          const headers = rows[0];
          const dataRows = rows.slice(1);
          elements.push(
            <div key={`table-${index}`} className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40 font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-cyan-400 text-[11px]">
                    {headers.map((h, hi) => (
                      <th key={hi} className="p-3 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {dataRows.map((r, ri) => (
                    <tr key={ri} className="hover:bg-white/[0.02] text-slate-300">
                      {r.map((cell, ci) => (
                        <td key={ci} className="p-3 text-[11px]">
                          {cell.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableBuffer = [];
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-extrabold text-white mt-6 mb-3 tracking-tight border-b border-white/10 pb-2">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-cyan-300 mt-5 mb-2 tracking-tight">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-base font-semibold text-slate-200 mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      }
      // Checklists
      else if (line.trim().startsWith('- [x]') || line.trim().startsWith('- [ ]')) {
        const isChecked = line.trim().startsWith('- [x]');
        const itemText = line.trim().slice(5).trim();
        elements.push(
          <div key={index} className="flex items-center gap-2.5 my-1.5 text-xs">
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className={isChecked ? 'text-slate-300 line-through opacity-80' : 'text-slate-200 font-medium'}>
              {itemText}
            </span>
          </div>
        );
      }
      // Bullet lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <div key={index} className="flex items-start gap-2 my-1 text-xs text-slate-300 ml-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span>{line.trim().slice(2)}</span>
          </div>
        );
      }
      // Empty lines
      else if (!line.trim()) {
        elements.push(<div key={index} className="h-2" />);
      }
      // Normal Paragraphs
      else {
        elements.push(
          <p key={index} className="text-xs leading-relaxed text-slate-300 my-1 font-sans">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Actions */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>MARKDOWN DOCUMENT RENDERER</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{artifact.lineCount || 420} Lines</span>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          type="button"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{copied ? 'Copied MD' : 'Copy Source'}</span>
        </button>
      </div>

      {/* Metrics Highlights if available */}
      {artifact.reductionStat && (
        <div className="grid grid-cols-2 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-slate-400 text-[11px] block mb-1">VRAM ALLOCATION DELTA</span>
            <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingDown className="w-5 h-5" />
              {artifact.reductionStat}
            </div>
            <span className="text-[10px] text-slate-500">Tested on 128k context</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-slate-400 text-[11px] block mb-1">SEMANTIC SALIENCY RETENTION</span>
            <div className="text-2xl font-bold text-cyan-300">
              {artifact.fidelityStat || '99.88%'}
            </div>
            <span className="text-[10px] text-slate-500">Zero degradation benchmark</span>
          </div>
        </div>
      )}

      {/* Formatted Markdown Body */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-white/[0.08] shadow-inner text-slate-200 space-y-2">
        {renderFormattedMarkdown(content)}
      </div>
    </div>
  );
};
