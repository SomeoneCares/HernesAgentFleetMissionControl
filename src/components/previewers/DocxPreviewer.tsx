import React, { useState } from 'react';
import { ArtifactItem } from '../../types';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  ShieldAlert, 
  Clock, 
  Users, 
  BookOpen,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface DocxPreviewerProps {
  artifact: ArtifactItem;
}

export const DocxPreviewer: React.FC<DocxPreviewerProps> = ({ artifact }) => {
  const docData = artifact.docxData || {
    title: artifact.name.replace('.docx', ''),
    subtitle: 'Standard Operating Procedure & Autonomous Directive',
    author: artifact.agent,
    organization: 'Hermes Fleet Command & Synthetic Ops',
    date: artifact.timestamp,
    classification: 'RESTRICTED / OPERATOR CLEARANCE REQUIRED',
    wordCount: 1420,
    readingTimeMinutes: 6,
    sections: [
      {
        heading: '1.0 Executive Summary & Objective',
        paragraphs: [
          'This document establishes the mandatory baseline requirements for autonomous cluster coordination across all partitioned fleets. In accordance with Hermes OS Directive 4.2, all synthetic workers must adhere to cryptographic telemetry verification and fail-safe handoff limits.',
          'Special operational protocols apply when context saturation exceeds 85% or when cross-fleet tool execution error rates rise above nominal thresholds.'
        ]
      },
      {
        heading: '2.0 Multi-Fleet Topology & Quorum Protocols',
        paragraphs: [
          'The autonomous agent swarm operates in federated clusters managed by Hermes Prime. Each fleet maintains independent tensor contexts and tool execution sandboxes to ensure process isolation and prevent memory corruption.',
          'Sub-agents must sign all IPC (Inter-Process Communication) payloads with their SHA-256 fleet signature before dispatching cross-fleet tasks.'
        ],
        tableData: {
          headers: ['Fleet Partition', 'Primary Model', 'Max Concurrency', 'Fail-Safe Mode'],
          rows: [
            ['FLEET-ALPHA-CORE', 'Claude 3.7 Sonnet', '64 Workers', 'Immediate Failover'],
            ['FLEET-QUANTUM-MATH', 'DeepSeek R1 671B', '32 Workers', 'Graceful Checkpoint'],
            ['FLEET-SEC-SENTINEL', 'Gemini 2.0 Flash', '128 Workers', 'Air-Gapped Sandbox']
          ]
        }
      },
      {
        heading: '3.0 Risk Mitigation & Circuit Breaker Limits',
        paragraphs: [
          'Autonomous handoffs must preserve KV-cache states in compressed columnar formats. In the event of an unrecoverable worker panic, tasks are automatically routed to the designated Fallback Fleet with human-operator notifications dispatched within 250 milliseconds.'
        ]
      }
    ],
    signOff: {
      signee: 'Hermes Supreme Command Quorum',
      date: '2026-09-05',
      status: 'RATIFIED & ENFORCED'
    }
  };

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.max(2, Math.ceil((docData.sections.length * 2) / 2));

  return (
    <div className="space-y-4 font-sans">
      {/* Office DOCX Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0e1422] border border-white/10 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">{artifact.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-semibold">
                DOCX (Word 2026)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span>{docData.wordCount.toLocaleString()} Words</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {docData.readingTimeMinutes} min read
              </span>
            </div>
          </div>
        </div>

        {/* Zoom & Page Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-slate-300">
            <button
              onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer"
              title="Zoom Out"
              type="button"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] min-w-[40px] text-center font-mono">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer"
              title="Zoom In"
              type="button"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-slate-300">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 cursor-pointer"
              type="button"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 cursor-pointer"
              type="button"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Styled Authentic Document Page (Paper Surface) */}
      <div className="flex justify-center p-2 sm:p-6 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto">
        <div 
          className="w-full max-w-3xl bg-[#fbfcfd] text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 transition-all"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Document Header & Security Classification */}
          <div className="border-b-2 border-slate-900 pb-6 mb-8">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-red-700 font-bold mb-3">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                {docData.classification}
              </span>
              <span>REF: DOCX-{artifact.sha.slice(0, 8).toUpperCase()}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 tracking-tight leading-tight">
              {docData.title}
            </h1>

            {docData.subtitle && (
              <p className="text-sm font-sans text-slate-600 mt-1 font-medium">
                {docData.subtitle}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200 text-xs text-slate-600 font-sans">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">AUTHOR</span>
                <span className="font-semibold text-slate-800">{docData.author}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">ORGANIZATION</span>
                <span className="font-semibold text-slate-800">{docData.organization}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">DATE ISSUED</span>
                <span className="font-semibold text-slate-800">{docData.date}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">DOCUMENT STATUS</span>
                <span className="font-semibold text-emerald-700">{docData.signOff?.status || 'APPROVED'}</span>
              </div>
            </div>
          </div>

          {/* Document Content Sections */}
          <div className="space-y-8 text-slate-800 leading-relaxed text-sm">
            {docData.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1">
                  {section.heading}
                </h2>

                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-700 text-justify leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* Embedded Table if present */}
                {section.tableData && (
                  <div className="my-4 overflow-x-auto rounded border border-slate-300">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
                          {section.tableData.headers.map((h, hi) => (
                            <th key={hi} className="p-2.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {section.tableData.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-slate-50">
                            {row.map((cell, ci) => (
                              <td key={ci} className="p-2.5 font-medium text-slate-700">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* Document Ratification & Sign-off Block */}
            {docData.signOff && (
              <div className="mt-12 pt-6 border-t-2 border-slate-300 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">RATIFIED BY</span>
                  <span className="font-serif italic font-bold text-slate-900 text-sm">{docData.signOff.signee}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">Automated Cryptographic Seal Applied</span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold px-2 py-1 rounded bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {docData.signOff.status}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">{docData.signOff.date}</span>
                </div>
              </div>
            )}
          </div>

          {/* Document Footer */}
          <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Hermes Mission Control DOCX Parser</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
