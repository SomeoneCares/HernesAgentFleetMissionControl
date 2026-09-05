import React, { useState } from 'react';
import { ArtifactItem } from '../types';
import { INITIAL_ARTIFACTS } from '../data/mockData';
import { 
  FolderArchive, 
  Search, 
  Download, 
  FileCode, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Database, 
  HardDrive, 
  Cpu,
  Sparkles,
  TrendingDown
} from 'lucide-react';

export const ContentLibraryTab: React.FC = () => {
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>(INITIAL_ARTIFACTS);
  const [selectedArtifactId, setSelectedArtifactId] = useState(INITIAL_ARTIFACTS[0].id);
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'raw' | 'metadata' | 'vector'>('preview');
  const [filterClass, setFilterClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCid, setCopiedCid] = useState(false);

  const selectedArtifact = artifacts.find(a => a.id === selectedArtifactId) || artifacts[0];

  const filteredArtifacts = artifacts.filter(art => {
    const matchesSearch = art.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.agent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'ALL' || 
                         (filterClass === 'CODE' && (art.extension === 'PY' || art.extension === 'YAML')) ||
                         (filterClass === 'RESEARCH' && art.extension === 'MD') ||
                         (filterClass === 'DATA' && (art.extension === 'JSON' || art.extension === 'PARQUET'));
    return matchesSearch && matchesClass;
  });

  const handleCopyCid = () => {
    navigator.clipboard.writeText(`ipfs://Qm${selectedArtifact.sha}hermes42`);
    setCopiedCid(true);
    setTimeout(() => setCopiedCid(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-14">
      {/* 1. TOP HEADER & CLUSTER STORAGE STATS */}
      <section className="rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#4cd7f6]" />
              <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-medium">
                STORAGE FABRIC & IPFS REPOSITORY
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Content & Artifact Library</h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Synthetic dataset checkpoints, code patch diffs, telemetry profiler dumps, and research papers
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] px-5 py-3 rounded-xl font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase">CLUSTER OBJECT STORE</span>
              <span className="text-white font-bold text-sm">842.1 GB <span className="text-slate-500 font-normal">/ 2.0 TB (42%)</span></span>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4edea3]" />
              <span>S3 & IPFS SYNCED</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Pills */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artifacts, hashes, agents... (⌘K)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {[
              { id: 'ALL', label: 'All Artifacts' },
              { id: 'CODE', label: 'Code & Patches' },
              { id: 'RESEARCH', label: 'Research Reports' },
              { id: 'DATA', label: 'Datasets & SQL' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterClass(f.id)}
                className={`px-3.5 py-1.5 rounded-xl border transition-all ${
                  filterClass === f.id
                    ? 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30 font-medium'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border-white/[0.08]'
                }`}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MASTER-DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Master List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredArtifacts.map((art) => {
            const isSelected = art.id === selectedArtifact.id;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArtifactId(art.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer font-mono text-xs space-y-2.5 ${
                  isSelected
                    ? 'bg-cyan-400/[0.08] border-cyan-400/40 shadow-[0_0_20px_rgba(76,215,246,0.1)]'
                    : 'bg-[#101622]/65 hover:bg-white/[0.04] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      art.extension === 'MD'
                        ? 'bg-purple-400/10 text-purple-300 border-purple-400/20'
                        : art.extension === 'PY'
                        ? 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20'
                        : 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                    }`}>
                      .{art.extension}
                    </span>
                    <span className="font-bold text-white truncate text-xs">{art.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{art.size}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{art.agent}</span>
                  <span className="text-emerald-400">{art.status}</span>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                  <span>SHA: {art.sha}</span>
                  <span>{art.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          {/* Detail Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-cyan-400">ARTIFACT INSPECTOR</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">SHA: {selectedArtifact.sha}</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{selectedArtifact.name}</h3>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={handleCopyCid}
                className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1.5"
                type="button"
              >
                {copiedCid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedCid ? 'Copied' : 'Copy CID'}</span>
              </button>

              <button
                onClick={() => alert(`Initiating export for ${selectedArtifact.name}`)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#07090e] font-bold shadow-[0_0_12px_rgba(76,215,246,0.3)] transition-all flex items-center gap-1.5"
                type="button"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-2 py-4 border-b border-white/[0.06] font-mono text-xs">
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'preview'
                  ? 'bg-cyan-400/15 text-cyan-300 font-semibold border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rendered Preview
            </button>
            <button
              onClick={() => setActiveSubTab('raw')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'raw'
                  ? 'bg-cyan-400/15 text-cyan-300 font-semibold border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Document
            </button>
            <button
              onClick={() => setActiveSubTab('metadata')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'metadata'
                  ? 'bg-cyan-400/15 text-cyan-300 font-semibold border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Metadata & Lineage
            </button>
          </div>

          {/* Content Area */}
          <div className="pt-6 font-mono text-xs space-y-6">
            {activeSubTab === 'preview' && (
              <div className="space-y-6 text-slate-300 leading-relaxed font-sans">
                {selectedArtifact.proposalHeader && (
                  <div className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                    {selectedArtifact.proposalHeader}
                  </div>
                )}

                <p className="text-sm text-slate-200">
                  {selectedArtifact.previewSummary || 'Artifact inspected and indexed across the vector cluster.'}
                </p>

                {/* Infographic Highlights */}
                {selectedArtifact.reductionStat && (
                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-slate-400 text-[11px] block mb-1">VRAM ALLOCATION DELTA</span>
                      <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
                        <TrendingDown className="w-5 h-5" />
                        {selectedArtifact.reductionStat}
                      </div>
                      <span className="text-[10px] text-slate-500">Benchmark on 128k context</span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-slate-400 text-[11px] block mb-1">SEMANTIC SALIENCY RETENTION</span>
                      <div className="text-2xl font-bold text-cyan-300">
                        {selectedArtifact.fidelityStat}
                      </div>
                      <span className="text-[10px] text-slate-500">Zero degradation on long horizon</span>
                    </div>
                  </div>
                )}

                {/* Mathematical / Attention Matrix Formula (from Mockup Image 7) */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-xs">
                  <div className="text-slate-400 text-[11px] mb-2 uppercase tracking-wide">ATTENTION SALIENCY EQUATION:</div>
                  <div className="text-cyan-300 bg-white/[0.02] p-3 rounded-lg text-center font-bold text-sm tracking-wide">
                    {"S(b) = \\sum_{i \\in b} \\alpha_i \\cdot \\exp(-\\lambda \\cdot (t_{now} - t_i))"}
                  </div>
                </div>

                {/* Code Snippet */}
                {selectedArtifact.rawContent && (
                  <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black/60 font-mono text-xs">
                    <div className="px-4 py-2 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Python Implementation Snippet</span>
                      <span className="text-cyan-400">PagedAttentionPool</span>
                    </div>
                    <pre className="p-4 text-slate-300 overflow-x-auto">
                      <code>{selectedArtifact.rawContent}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'raw' && (
              <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] overflow-x-auto font-mono text-xs text-cyan-300/90 leading-relaxed">
                <pre>{selectedArtifact.rawContent || JSON.stringify(selectedArtifact, null, 2)}</pre>
              </div>
            )}

            {activeSubTab === 'metadata' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">Author Agent:</span>
                  <span className="text-white">{selectedArtifact.agent}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">File Extension:</span>
                  <span className="text-cyan-400 font-bold">.{selectedArtifact.extension}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">Size on Disk:</span>
                  <span className="text-white">{selectedArtifact.size}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">IPFS CID Hash:</span>
                  <span className="text-purple-300 font-bold">Qm{selectedArtifact.sha}hermes42</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-slate-400">Residency Tier:</span>
                  <span className="text-emerald-400 font-bold">{selectedArtifact.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
