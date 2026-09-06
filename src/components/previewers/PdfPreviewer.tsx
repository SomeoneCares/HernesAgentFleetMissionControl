import React, { useState } from 'react';
import { ArtifactItem } from '../../types';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Columns, 
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Bookmark
} from 'lucide-react';

interface PdfPreviewerProps {
  artifact: ArtifactItem;
}

export const PdfPreviewer: React.FC<PdfPreviewerProps> = ({ artifact }) => {
  const pdfData = artifact.pdfData || {
    paperTitle: artifact.name.replace('.pdf', ''),
    authors: [artifact.agent, 'Hermes Quorum Research Lab', 'Autonomous Agent Foundation'],
    abstract: 'We present a formal framework for federated multi-agent swarm orchestration with bounded entropy context handoffs. Under adversarial conditions and token saturation, our protocol guarantees sub-millisecond route convergence with zero transcript degradation. Empirical evaluations demonstrate a 4.2x reduction in inter-agent communication overhead while preserving 99.88% semantic saliency across 128k context windows.',
    pageCount: 4,
    arxivId: `arXiv:2609.${artifact.sha.slice(0, 5)}v1`,
    sections: [
      {
        sectionNumber: 'I',
        title: 'Introduction & System Model',
        text: 'Autonomous multi-agent architectures increasingly depend on dynamic task decomposition across heterogeneous model backbones. When coordinating specialized sub-agents, state transfer between disparate neural weights typically incurs severe information loss. To resolve this, we introduce the Federated Routing Topology with cryptographic verification.'
      },
      {
        sectionNumber: 'II',
        title: 'Mathematical Formulation & Handoff Bounds',
        text: 'Let S_t denote the global cluster state at step t. The transition probability for cross-fleet handoffs is constrained by the mutual information lower bound:',
        equation: 'I(X_t; Y_{t+1}) \\ge \\mathbb{E}_{q}[\\log p(Y | X)] - \\mathcal{D}_{KL}(q(Z|X) \\;\\Vert\\; p(Z))',
        calloutBox: 'Theorem 1 (Bounded Handoff Invariant): In any acyclic fleet topology with max hops k <= 6, task deadlock is strictly eliminated with probability 1 - 2^{-128}.'
      },
      {
        sectionNumber: 'III',
        title: 'Empirical Verification & Benchmark Matrix',
        text: 'We benchmarked the Hermes 4.2 dispatch engine against standard round-robin and naive greedy routing across 10,000 synthetic task batches.',
        resultsTable: {
          headers: ['Routing Strategy', 'Latency (p99)', 'Context Loss', 'Failover Success'],
          rows: [
            ['Intent-Affinity (Ours)', '18.4 ms', '< 0.02%', '99.98%'],
            ['Least-Loaded Greedy', '42.1 ms', '1.45%', '97.20%'],
            ['Static Partitioning', '84.0 ms', '5.12%', '89.40%']
          ]
        }
      },
      {
        sectionNumber: 'IV',
        title: 'Conclusion',
        text: 'The proposed fleet architecture and autonomous handoff rules provide a robust foundation for production agent workloads requiring high availability and verifiable state preservation.'
      }
    ]
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isTwoColumn, setIsTwoColumn] = useState<boolean>(true);

  return (
    <div className="space-y-4 font-sans">
      {/* PDF Viewer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#1e0f0f] border border-red-500/20 text-slate-200 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold">
            PDF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">{artifact.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 font-semibold">
                {pdfData.arxivId || 'TECHNICAL REPORT'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span>{pdfData.pageCount} Pages</span>
              <span>•</span>
              <span>{artifact.size}</span>
              <span>•</span>
              <span>IEEE / arXiv Format</span>
            </div>
          </div>
        </div>

        {/* PDF Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTwoColumn(!isTwoColumn)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-[11px] ${
              isTwoColumn ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-white/[0.04] text-slate-400 border-white/10'
            }`}
            title="Toggle 2-Column Academic Layout"
            type="button"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>2-Col</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-slate-300">
            <button
              onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer"
              title="Zoom Out"
              type="button"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] min-w-[36px] text-center font-mono">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(125, prev + 10))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer"
              title="Zoom In"
              type="button"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page controls */}
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
              Page {currentPage} of {pdfData.pageCount}
            </span>
            <button
              disabled={currentPage >= pdfData.pageCount}
              onClick={() => setCurrentPage(p => Math.min(pdfData.pageCount, p + 1))}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 cursor-pointer"
              type="button"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Styled Academic Paper Canvas */}
      <div className="flex justify-center p-2 sm:p-6 bg-black/50 rounded-2xl border border-white/10 overflow-x-auto">
        <div 
          className="w-full max-w-3xl bg-[#ffffff] text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 transition-all"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Paper Title & Authors */}
          <div className="text-center pb-6 border-b border-slate-200">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
              HERMES AUTONOMOUS CLUSTER RESEARCH COMMUNICATIONS • {pdfData.arxivId}
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-950 tracking-tight leading-snug">
              {pdfData.paperTitle}
            </h1>

            <div className="mt-3 text-xs text-slate-700 font-medium">
              {pdfData.authors.join(' • ')}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Synthetic Autonomous Systems Group • Published: {artifact.timestamp}
            </div>
          </div>

          {/* Abstract Block */}
          <div className="my-6 p-4 bg-slate-50 border-l-4 border-slate-700 rounded text-xs text-slate-800 leading-relaxed">
            <strong className="text-slate-950 font-bold uppercase tracking-wide block mb-1">Abstract—</strong>
            <p className="font-serif italic text-justify">
              {pdfData.abstract}
            </p>
          </div>

          {/* Paper Body (Optional Two-Column or Single-Column) */}
          <div className={`gap-8 space-y-6 ${isTwoColumn ? 'sm:grid sm:grid-cols-2 sm:space-y-0' : ''}`}>
            {pdfData.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2 text-xs text-slate-800 leading-relaxed font-serif">
                <h3 className="font-sans font-bold text-slate-950 uppercase tracking-wide text-xs border-b border-slate-200 pb-1">
                  {sec.sectionNumber}. {sec.title}
                </h3>
                
                <p className="text-justify">
                  {sec.text}
                </p>

                {/* Formatted Math Equation */}
                {sec.equation && (
                  <div className="my-3 p-3 bg-slate-100 rounded border border-slate-300 font-mono text-[11px] text-center text-slate-900 overflow-x-auto">
                    {sec.equation}
                  </div>
                )}

                {/* Callout Theorem Box */}
                {sec.calloutBox && (
                  <div className="my-3 p-3 bg-red-50 border-l-2 border-red-700 text-[11px] text-red-950 rounded font-sans leading-snug">
                    {sec.calloutBox}
                  </div>
                )}

                {/* Results Table */}
                {sec.resultsTable && (
                  <div className="my-3 overflow-x-auto rounded border border-slate-300">
                    <table className="w-full text-left text-[10px] font-sans border-collapse">
                      <thead>
                        <tr className="bg-slate-200 text-slate-900 border-b border-slate-300 font-bold">
                          {sec.resultsTable.headers.map((h, hi) => (
                            <th key={hi} className="p-1.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {sec.resultsTable.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-slate-50">
                            {row.map((cell, ci) => (
                              <td key={ci} className="p-1.5 font-mono">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paper Footer */}
          <div className="mt-12 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Hermes Cluster Verified Artifact // SHA-256: {artifact.sha.slice(0, 16)}</span>
            <span>Page {currentPage} of {pdfData.pageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
