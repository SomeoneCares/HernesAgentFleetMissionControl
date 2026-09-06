import React, { useState } from 'react';
import { ArtifactItem } from '../../types';
import { 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Eye, 
  Sliders, 
  Maximize2, 
  Camera, 
  Info,
  Sparkles,
  Layers,
  Thermometer
} from 'lucide-react';

interface PhotoPreviewerProps {
  artifact: ArtifactItem;
}

export const PhotoPreviewer: React.FC<PhotoPreviewerProps> = ({ artifact }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'normal' | 'thermal' | 'invert' | 'cyber'>('normal');
  const [showMetadata, setShowMetadata] = useState<boolean>(true);

  const meta = artifact.imageMetadata || {
    dimensions: '3840 × 2160 (4K UHD)',
    aspectRatio: '16:9',
    colorSpace: 'sRGB IEC61966-2.1',
    bitDepth: '24-bit TrueColor',
    sensorCamera: 'FLIR MWIR A6700sc Cooled Cryo-Sensor',
    focalLength: '50mm f/1.8',
    iso: 'ISO 200',
    exposure: '1/2000 sec'
  };

  const imageUrl = artifact.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80';

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'thermal':
        return 'hue-rotate-180 contrast-150 saturate-200';
      case 'invert':
        return 'invert';
      case 'cyber':
        return 'hue-rotate-90 saturate-150 contrast-125';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Photo Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0f141f] border border-cyan-500/20 text-slate-200 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">{artifact.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold uppercase">
                {artifact.extension} IMAGE
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span>{meta.dimensions}</span>
              <span>•</span>
              <span>{artifact.size}</span>
              <span>•</span>
              <span className="text-cyan-400">{meta.sensorCamera}</span>
            </div>
          </div>
        </div>

        {/* Image Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Mode Selector */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-slate-300">
            {(['normal', 'thermal', 'cyber', 'invert'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  filterMode === mode 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-slate-300">
            <button
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer"
              title="Zoom Out"
              type="button"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] min-w-[36px] text-center font-mono">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(200, prev + 15))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer"
              title="Zoom In"
              type="button"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate */}
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Rotate 90°"
            type="button"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Metadata */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showMetadata 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' 
                : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/10'
            }`}
            title="Toggle Sensor EXIF Metadata"
            type="button"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative rounded-2xl bg-[#070a10] border border-white/10 p-4 sm:p-8 flex items-center justify-center min-h-[420px] overflow-hidden shadow-2xl">
        {/* Transparent Checkerboard Pattern Backdrop */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#4cd7f6 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />

        {/* Rendered Image */}
        <div 
          className="relative transition-all duration-200 max-w-full"
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={imageUrl}
            alt={artifact.name}
            className={`max-h-[500px] w-auto rounded-xl shadow-2xl border border-white/10 object-contain transition-all ${getFilterStyle()}`}
          />
        </div>
      </div>

      {/* Sensor Metadata & EXIF Specs Card */}
      {showMetadata && (
        <div className="p-4 rounded-xl bg-[#090e17] border border-white/10 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3 text-cyan-400">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="font-bold">SENSOR & OPTICAL TELEMETRY SPECIFICATION</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase">CALIBRATED RAW EXIF</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300 text-[11px]">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">DIMENSIONS</span>
              <strong className="text-white">{meta.dimensions}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">COLOR SPACE</span>
              <strong className="text-white">{meta.colorSpace}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">OPTICAL SENSOR</span>
              <strong className="text-cyan-300">{meta.sensorCamera}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-0.5">EXPOSURE / ISO</span>
              <strong className="text-white">{meta.exposure} • {meta.iso}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
