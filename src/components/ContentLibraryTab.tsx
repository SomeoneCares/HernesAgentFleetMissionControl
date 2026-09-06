import React, { useState, useRef } from 'react';
import { useCluster } from '../context/ClusterContext';
import { ArtifactItem } from '../types';
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
  TrendingDown,
  Upload,
  Plus,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  FileCheck,
  Tag,
  Filter
} from 'lucide-react';

// Specialized Document & Media Previewers
import { MarkdownPreviewer } from './previewers/MarkdownPreviewer';
import { DocxPreviewer } from './previewers/DocxPreviewer';
import { SpreadsheetPreviewer } from './previewers/SpreadsheetPreviewer';
import { PresentationPreviewer } from './previewers/PresentationPreviewer';
import { PdfPreviewer } from './previewers/PdfPreviewer';
import { PhotoPreviewer } from './previewers/PhotoPreviewer';

export const ContentLibraryTab: React.FC = () => {
  const { artifacts, addArtifact, showToast } = useCluster();
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(artifacts[0]?.id || 'art-01');
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'raw' | 'metadata' | 'vector'>('preview');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCid, setCopiedCid] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedArtifact = artifacts.find(a => a.id === selectedArtifactId) || artifacts[0];

  // Extension badge styling & label
  const getExtensionBadge = (ext: string) => {
    const e = ext.toUpperCase();
    switch (e) {
      case 'MD':
        return { label: '.MD', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'DOCX':
        return { label: '.DOCX', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'XLSX':
        return { label: '.XLSX', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'PPTX':
        return { label: '.PPTX', bg: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
      case 'PDF':
        return { label: '.PDF', bg: 'bg-red-500/15 text-red-300 border-red-500/30' };
      case 'PNG':
      case 'JPG':
      case 'JPEG':
        return { label: `.${e}`, bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' };
      case 'PY':
        return { label: '.PY', bg: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30' };
      default:
        return { label: `.${e}`, bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    }
  };

  const filteredArtifacts = artifacts.filter(art => {
    const matchesSearch = art.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.extension.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterClass === 'ALL') return true;

    const ext = art.extension.toUpperCase();
    if (filterClass === 'MD') return ext === 'MD';
    if (filterClass === 'DOCX') return ext === 'DOCX';
    if (filterClass === 'XLSX') return ext === 'XLSX';
    if (filterClass === 'PPTX') return ext === 'PPTX';
    if (filterClass === 'PDF') return ext === 'PDF';
    if (filterClass === 'PHOTOS') return ext === 'PNG' || ext === 'JPG' || ext === 'JPEG' || ext === 'WEBP';
    if (filterClass === 'CODE') return ext === 'PY' || ext === 'YAML' || ext === 'JSON' || ext === 'PARQUET';

    return true;
  });

  const handleCopyCid = () => {
    if (!selectedArtifact) return;
    navigator.clipboard.writeText(`ipfs://Qm${selectedArtifact.sha}hermes42`);
    setCopiedCid(true);
    setTimeout(() => setCopiedCid(false), 2000);
  };

  // Handle direct file upload from user's machine
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toUpperCase() || 'DAT';
    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    // Process file reading
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newArt: ArtifactItem = {
          id: `art-upload-${Date.now()}`,
          name: fileName,
          extension,
          size: fileSizeFormatted,
          timestamp: 'Just now',
          agent: 'Operator Upload',
          sha: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6),
          status: 'HOT_MEMORY',
          imageUrl,
          imageMetadata: {
            dimensions: 'Native Upload Resolution',
            aspectRatio: 'Auto',
            colorSpace: 'sRGB',
            bitDepth: '24-bit',
            sensorCamera: 'User Local Ingestion',
            exposure: 'N/A',
            iso: 'N/A'
          }
        };
        addArtifact(newArt);
        setSelectedArtifactId(newArt.id);
        setIsUploading(false);
        showToast(`Uploaded and indexed image: ${fileName}`);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string;
        const newArt: ArtifactItem = {
          id: `art-upload-${Date.now()}`,
          name: fileName,
          extension,
          size: fileSizeFormatted,
          timestamp: 'Just now',
          agent: 'Operator Upload',
          sha: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6),
          status: 'HOT_MEMORY',
          rawContent: textContent.slice(0, 50000),
          previewSummary: `User ingested ${extension} artifact containing ${Math.round(file.size / 1024)} KB of data.`
        };
        addArtifact(newArt);
        setSelectedArtifactId(newArt.id);
        setIsUploading(false);
        showToast(`Uploaded and indexed ${extension} document: ${fileName}`);
      };
      reader.readAsText(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render the appropriate preview component based on file extension
  const renderDynamicPreview = () => {
    if (!selectedArtifact) {
      return (
        <div className="p-8 text-center text-slate-500 font-mono text-xs">
          Select an artifact to preview.
        </div>
      );
    }

    const ext = selectedArtifact.extension.toUpperCase();

    // 1. MARKDOWN (.md)
    if (ext === 'MD') {
      return <MarkdownPreviewer artifact={selectedArtifact} />;
    }

    // 2. WORD DOCUMENT (.docx)
    if (ext === 'DOCX') {
      return <DocxPreviewer artifact={selectedArtifact} />;
    }

    // 3. EXCEL SPREADSHEET (.xlsx)
    if (ext === 'XLSX') {
      return <SpreadsheetPreviewer artifact={selectedArtifact} />;
    }

    // 4. POWERPOINT KEYNOTE / DECK (.pptx)
    if (ext === 'PPTX') {
      return <PresentationPreviewer artifact={selectedArtifact} />;
    }

    // 5. PDF TECHNICAL REPORT (.pdf)
    if (ext === 'PDF') {
      return <PdfPreviewer artifact={selectedArtifact} />;
    }

    // 6. PHOTOS & SENSOR IMAGES (.png, .jpg, .jpeg, .webp)
    if (['PNG', 'JPG', 'JPEG', 'WEBP'].includes(ext) || selectedArtifact.imageUrl) {
      return <PhotoPreviewer artifact={selectedArtifact} />;
    }

    // 7. CODE & DATA FALLBACK (Python, YAML, JSON, Parquet)
    return (
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
                {selectedArtifact.fidelityStat || '99.88%'}
              </div>
              <span className="text-[10px] text-slate-500">Zero degradation on long horizon</span>
            </div>
          </div>
        )}

        {/* Mathematical / Attention Saliency Equation */}
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
              <span>Source Implementation File</span>
              <span className="text-cyan-400 font-bold">{selectedArtifact.name}</span>
            </div>
            <pre className="p-4 text-cyan-300/90 overflow-x-auto">
              <code>{selectedArtifact.rawContent}</code>
            </pre>
          </div>
        )}
      </div>
    );
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
              Multi-format document inspector: preview MD, DOCX, XLSX, PPTX, PDF, and high-resolution Photos with optical telemetry
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Hidden native file input for upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".md,.docx,.xlsx,.pptx,.pdf,.png,.jpg,.jpeg,.json,.py,.yaml"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(76,215,246,0.15)]"
              type="button"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Ingesting File...' : 'Ingest Document / Media'}</span>
            </button>

            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 rounded-xl font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">SYNTHETIC OBJECT STORE</span>
                <span className="text-white font-bold text-xs">{artifacts.length} Active Artifacts</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4edea3]" />
                <span>IPFS SYNCED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Comprehensive Format Filters */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artifacts, hashes, agents... (⌘K)"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* All Requested Document Format Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs overflow-x-auto">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'MD', label: 'MD', icon: FileText, color: 'text-purple-400' },
              { id: 'DOCX', label: 'DOCX', icon: FileText, color: 'text-blue-400' },
              { id: 'XLSX', label: 'XLSX', icon: FileSpreadsheet, color: 'text-emerald-400' },
              { id: 'PPTX', label: 'PPTX', icon: Presentation, color: 'text-orange-400' },
              { id: 'PDF', label: 'PDF', icon: FileText, color: 'text-red-400' },
              { id: 'PHOTOS', label: 'Photos', icon: ImageIcon, color: 'text-cyan-400' },
              { id: 'CODE', label: 'Code', icon: FileCode, color: 'text-slate-300' }
            ].map((f) => {
              const Icon = f.icon;
              const isActive = filterClass === f.id;

              return (
                <button
                  key={f.id}
                  onClick={() => setFilterClass(f.id)}
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-300 border-cyan-400/40 font-bold shadow-[0_0_10px_rgba(76,215,246,0.15)]'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white border-white/[0.06]'
                  }`}
                  type="button"
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${f.color || ''}`} />}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MASTER-DETAIL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Master List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>INDEXED ASSETS ({filteredArtifacts.length})</span>
            <span>FILTER: {filterClass}</span>
          </div>

          {filteredArtifacts.map((art) => {
            const isSelected = art.id === selectedArtifact?.id;
            const badge = getExtensionBadge(art.extension);

            return (
              <div
                key={art.id}
                onClick={() => setSelectedArtifactId(art.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer font-mono text-xs space-y-2.5 ${
                  isSelected
                    ? 'bg-cyan-400/[0.08] border-cyan-400/40 shadow-[0_0_20px_rgba(76,215,246,0.1)] ring-1 ring-cyan-400/30'
                    : 'bg-[#101622]/65 hover:bg-white/[0.04] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="font-bold text-white truncate text-xs">{art.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">{art.size}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{art.agent}</span>
                  <span className="text-emerald-400">{art.status}</span>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                  <span>SHA: {art.sha.slice(0, 12)}</span>
                  <span>{art.timestamp}</span>
                </div>
              </div>
            );
          })}

          {filteredArtifacts.length === 0 && (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center font-mono text-xs text-slate-500">
              No artifacts match the current filter or search criteria.
            </div>
          )}
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#101622]/65 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          {selectedArtifact ? (
            <>
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
                    className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    {copiedCid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedCid ? 'Copied' : 'Copy CID'}</span>
                  </button>

                  <button
                    onClick={() => showToast(`Export initiated for ${selectedArtifact.name}`)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#07090e] font-bold shadow-[0_0_12px_rgba(76,215,246,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
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
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSubTab === 'preview'
                      ? 'bg-cyan-400/15 text-cyan-300 font-semibold border border-cyan-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  type="button"
                >
                  Interactive Preview
                </button>
                <button
                  onClick={() => setActiveSubTab('raw')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSubTab === 'raw'
                      ? 'bg-cyan-400/15 text-cyan-300 font-semibold border border-cyan-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  type="button"
                >
                  Raw Content
                </button>
                <button
                  onClick={() => setActiveSubTab('metadata')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeSubTab === 'metadata'
                      ? 'bg-cyan-400/15 text-cyan-300 font-semibold border border-cyan-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  type="button"
                >
                  Metadata & Lineage
                </button>
              </div>

              {/* Dynamic Content Preview Area */}
              <div className="pt-6">
                {activeSubTab === 'preview' && renderDynamicPreview()}

                {activeSubTab === 'raw' && (
                  <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] overflow-x-auto font-mono text-xs text-cyan-300/90 leading-relaxed max-h-[500px]">
                    <pre>{selectedArtifact.rawContent || JSON.stringify(selectedArtifact, null, 2)}</pre>
                  </div>
                )}

                {activeSubTab === 'metadata' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-slate-400">Author Agent / Source:</span>
                      <span className="text-white">{selectedArtifact.agent}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-slate-400">Format Extension:</span>
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
                    {selectedArtifact.imageMetadata && (
                      <>
                        <div className="flex justify-between py-2 border-b border-white/[0.04]">
                          <span className="text-slate-400">Optical Sensor:</span>
                          <span className="text-cyan-300">{selectedArtifact.imageMetadata.sensorCamera}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/[0.04]">
                          <span className="text-slate-400">Frame Resolution:</span>
                          <span className="text-white">{selectedArtifact.imageMetadata.dimensions}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 font-mono text-xs">
              Select an artifact from the repository on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
