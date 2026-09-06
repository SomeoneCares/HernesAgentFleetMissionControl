import React, { useState, useEffect } from 'react';
import { ArtifactItem } from '../../types';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Presentation, 
  FileSpreadsheet, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PresentationPreviewerProps {
  artifact: ArtifactItem;
}

export const PresentationPreviewer: React.FC<PresentationPreviewerProps> = ({ artifact }) => {
  const presentationData = artifact.presentationData || {
    deckTitle: artifact.name.replace('.pptx', ''),
    theme: 'cyber-executive',
    totalSlides: 4,
    slides: [
      {
        slideNumber: 1,
        title: 'Hermes Fleet Architecture & Handoff Protocols',
        subtitle: 'Autonomous Swarm Scaling & High-Concurrency Telemetry',
        bullets: [
          'Federated cluster orchestration across 4 partitioned agent fleets',
          'Intelligent KV-cache handoff with zero semantic degradation',
          'Sub-250ms dynamic failover with human-in-the-loop escalation gates'
        ],
        notes: 'Emphasize to the board that fleet separation prevents memory contamination across divergent model weights.'
      },
      {
        slideNumber: 2,
        title: 'Workload Partitioning Matrix',
        subtitle: 'Autonomous Role Specialization by Model Architecture',
        bullets: [
          'FLEET-ALPHA-CORE: Generalist synthesis and operator command routing',
          'FLEET-QUANTUM-MATH: Deep theoretical reasoning and cryptographic audits',
          'FLEET-SEC-SENTINEL: Vulnerability scanners and air-gapped sandboxes',
          'FLEET-CREATIVE-EXP: UI plugins, cyber-pet telemetry, and dynamic themes'
        ],
        notes: 'Point out the 65.6% load factor leaving ample headroom for burst tasks.'
      },
      {
        slideNumber: 3,
        title: 'Dynamic Handoff & Circuit Breakers',
        subtitle: 'Fail-Safe Autonomous Delegation Policies',
        bullets: [
          'Confidence Breaker: Handoff if model certainty drops below 75%',
          'Context Breaker: Migrate transcript when token saturation exceeds 85%',
          'Quorum Ratification: All P1 critical operations require operator approval'
        ],
        notes: 'Operators can customize these thresholds directly in the new Fleet Routing modal.'
      },
      {
        slideNumber: 4,
        title: 'Production Roadmap & Next Directives',
        subtitle: 'Autonomous Milestones for Hermes 4.2',
        bullets: [
          'Phase I: Full multi-document content library previews (MD, DOCX, XLSX, PPTX, PDF, PNG)',
          'Phase II: WebRTC peer-to-peer operator comms with neural voice synthesis',
          'Phase III: Distributed cluster deployment with automated backup snapshots'
        ],
        notes: 'Close presentation with a live simulation in the routing test bench.'
      }
    ]
  };

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const slides = presentationData.slides;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Auto-advance slideshow when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  return (
    <div className={`space-y-4 font-sans ${isFullscreen ? 'fixed inset-0 z-50 bg-[#07090e] p-6 flex flex-col justify-between' : ''}`}>
      {/* PPTX Header & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#1a120b] border border-orange-500/20 text-slate-200 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-bold">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">{artifact.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-300 font-semibold">
                PPTX DECK
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span>{slides.length} Slides</span>
              <span>•</span>
              <span>16:9 Widescreen</span>
              <span>•</span>
              <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            </div>
          </div>
        </div>

        {/* Deck Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/10'
            }`}
            type="button"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Show' : 'Play Slideshow'}</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showNotes 
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' 
                : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/10'
            }`}
            title="Speaker Notes"
            type="button"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            type="button"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Presentation Slide Viewport (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#04060a] border border-white/10 shadow-2xl p-6 sm:p-12 flex flex-col justify-between overflow-hidden">
        {/* Subtle Cyber Grid & Accent Flares */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Slide Top Meta */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 z-10">
          <div className="flex items-center gap-2 font-mono text-[11px] text-orange-400 uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HERMES AUTONOMOUS CLUSTER DIRECTIVE</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            SLIDE {String(currentSlideIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>
        </div>

        {/* Slide Center Body */}
        <div className="my-auto py-6 z-10 max-w-3xl space-y-6">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {currentSlide.title}
            </h2>
            {currentSlide.subtitle && (
              <p className="text-sm sm:text-lg text-cyan-300 font-medium mt-2">
                {currentSlide.subtitle}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {currentSlide.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3 text-slate-200 text-xs sm:text-sm leading-relaxed">
                <div className="p-1 rounded bg-orange-500/20 text-orange-400 shrink-0 mt-1">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Bottom Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] z-10 text-[10px] font-mono text-slate-400">
          <span>CONFIDENTIAL // INTERNAL FLEET REVIEW ONLY</span>
          <span>{artifact.timestamp}</span>
        </div>

        {/* Floating Navigation Arrows */}
        <button
          disabled={currentSlideIndex <= 0}
          onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 disabled:opacity-20 transition-all cursor-pointer z-20"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          disabled={currentSlideIndex >= slides.length - 1}
          onClick={() => setCurrentSlideIndex(i => Math.min(slides.length - 1, i + 1))}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 disabled:opacity-20 transition-all cursor-pointer z-20"
          type="button"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Speaker Notes Drawer */}
      {showNotes && currentSlide.notes && (
        <div className="p-4 rounded-xl bg-[#14120f] border border-orange-500/30 text-xs font-mono text-orange-200/90 flex items-start gap-3 animate-in fade-in duration-150">
          <MessageSquare className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-orange-400 block mb-1 uppercase tracking-wider text-[10px]">
              Presenter Speaker Notes:
            </strong>
            <p className="font-sans text-slate-300 leading-relaxed">
              {currentSlide.notes}
            </p>
          </div>
        </div>
      )}

      {/* Thumbnail Carousel Strip */}
      <div className="grid grid-cols-4 gap-3">
        {slides.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              currentSlideIndex === idx
                ? 'bg-orange-500/10 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
            type="button"
          >
            <span className="text-[10px] font-mono text-orange-400 font-bold block mb-1">
              SLIDE {idx + 1}
            </span>
            <span className="text-xs font-bold text-white line-clamp-1">
              {slide.title}
            </span>
            <span className="text-[10px] text-slate-400 line-clamp-1 mt-1">
              {slide.subtitle || slide.bullets[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
