import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Activity, 
  Wifi, 
  ShieldCheck, 
  Volume2, 
  Settings2, 
  Sparkles,
  Maximize2,
  Minimize2,
  Radio,
  Share2
} from 'lucide-react';

interface WebRtcModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentCodename: string;
  agentPhoto?: string;
  fleetName?: string;
}

export const WebRtcModal: React.FC<WebRtcModalProps> = ({
  isOpen,
  onClose,
  agentName,
  agentCodename,
  agentPhoto,
  fleetName = 'Alpha Core Fleet'
}) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [activeLayout, setActiveLayout] = useState<'split' | 'agent' | 'self'>('split');
  const [callDuration, setCallDuration] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Media Stream when opened
  useEffect(() => {
    if (!isOpen) {
      cleanupMedia();
      return;
    }

    setCallState('connecting');
    setCallDuration(0);
    setMediaError(null);

    let isMounted = true;

    const startLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup audio analyser for live audio visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const updateAudioMetric = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateAudioMetric);
          };
          updateAudioMetric();
        } catch (audioErr) {
          console.warn('Audio analyser setup fallback', audioErr);
        }

        setTimeout(() => {
          if (isMounted) {
            setCallState('connected');
          }
        }, 1200);

      } catch (err: any) {
        console.warn('WebRTC Camera/Mic access note:', err);
        setMediaError(
          err.name === 'NotAllowedError' 
            ? 'Webcam permission denied in browser. Running in simulated neural P2P stream.'
            : 'No camera hardware detected. Running in simulated neural P2P stream.'
        );
        // Fallback to connected state so user can experience the interface
        setTimeout(() => {
          if (isMounted) setCallState('connected');
        }, 1000);
      }
    };

    startLocalMedia();

    // Call duration timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      cleanupMedia();
    };
  }, [isOpen]);

  const cleanupMedia = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    } else {
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    } else {
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        screenStream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
        setScreenSharing(true);
      } catch (e) {
        console.warn('Screen share cancelled or failed', e);
      }
    } else {
      setScreenSharing(false);
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  };

  const handleHangup = () => {
    cleanupMedia();
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-5xl h-[88vh] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] font-mono text-xs text-white flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Holographic Top Banner Bar */}
        <div className="px-6 py-4 bg-[#0d1322] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">WebRTC Secure Neural Session</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {callState === 'connecting' ? 'HANDSHAKE...' : 'P2P ENCRYPTED (SRTP)'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Partner: <strong className="text-cyan-300">{agentName}</strong></span>
                <span>•</span>
                <span>Fleet: <span className="text-slate-300">{fleetName}</span></span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{formatDuration(callDuration)}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Chips & Close */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-[10px]">
              <span className="flex items-center gap-1 text-slate-400">
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-bold">14ms RTT</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">1080p @ 60fps</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">0.0% Loss</span>
            </div>

            <button
              onClick={handleHangup}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all border border-white/[0.06]"
              title="Close Call"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Warning Notice if camera permission blocked */}
        {mediaError && (
          <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>{mediaError}</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Simulated Feed Active</span>
          </div>
        )}

        {/* Video Canvas Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden bg-black/40 relative">
          {/* Remote Agent Video / Audio Feed */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c1424] to-[#080d18] border border-cyan-500/30 flex flex-col justify-between p-4 shadow-xl group">
            {/* Top Left Status */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-bold text-cyan-200 text-xs">{agentName}</span>
                <span className="text-[10px] text-slate-400">({agentCodename})</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold">
                NEURAL SYNTH V3.2
              </div>
            </div>

            {/* Center Video/Visual Representation */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
              {/* Animated Neural Rings */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
                <div className="absolute inset-4 rounded-full border border-cyan-400/40 animate-pulse" />
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(76,215,246,0.3)] bg-slate-900">
                  {agentPhoto ? (
                    <img
                      src={agentPhoto}
                      alt={agentName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan-300 text-3xl">
                      🤖
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Waveform Audio Bars */}
              <div className="mt-6 flex items-center gap-1.5 h-8">
                {[40, 65, 85, 95, 70, 50, 80, 100, 60, 45, 90, 75].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all duration-150"
                    style={{
                      height: callState === 'connected' ? `${Math.max(15, (height * (audioLevel + 30)) / 100)}%` : '20%'
                    }}
                  />
                ))}
              </div>

              <div className="text-[11px] text-cyan-300/80 mt-2 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>Live Neural Speech Stream Active</span>
              </div>
            </div>

            {/* Bottom Bar overlay */}
            <div className="z-10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-black/50 border border-white/5">
                Codec: Opus 48kHz / H.264
              </span>
              <span className="px-2 py-0.5 rounded bg-black/50 border border-white/5">
                VRAM: 28.4 GB Allocated
              </span>
            </div>
          </div>

          {/* Local Operator Video Stream */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex flex-col justify-between p-4 shadow-xl group">
            {/* Top Bar Status */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-white text-xs">Operator (Local Camera)</span>
              </div>
              <div className="flex items-center gap-2">
                {!videoEnabled && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    VIDEO OFF
                  </span>
                )}
                {!audioEnabled && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    MIC MUTED
                  </span>
                )}
              </div>
            </div>

            {/* Video Element */}
            <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${videoEnabled ? 'block' : 'hidden'}`}
              />
              {!videoEnabled && (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                  <VideoOff className="w-12 h-12 stroke-[1.5]" />
                  <span className="text-xs">Camera Feed Disabled</span>
                </div>
              )}
            </div>

            {/* Local Audio Activity Visualizer overlay */}
            <div className="z-10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px]">Mic Level:</span>
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>

              <span className="px-2 py-0.5 rounded bg-black/50 border border-white/5 text-[10px]">
                {screenSharing ? 'Screen Cast Active' : 'Front Facing Cam'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="px-6 py-4 bg-[#0d1322] border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Session Controls:</span>
            <div className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>TLS 1.3 / DTLS-SRTP P2P</span>
            </div>
          </div>

          {/* Action Center Buttons */}
          <div className="flex items-center gap-3">
            {/* Toggle Mic */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
                audioEnabled
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/10'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
              title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-rose-400" />}
            </button>

            {/* Toggle Video */}
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
                videoEnabled
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/10'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
              title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-rose-400" />}
            </button>

            {/* Toggle Screen Share */}
            <button
              type="button"
              onClick={toggleScreenShare}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
                screenSharing
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_15px_rgba(76,215,246,0.2)]'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/10'
              }`}
              title={screenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* End / Hang Up Button */}
            <button
              type="button"
              onClick={handleHangup}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center gap-2 text-xs font-mono"
            >
              <PhoneOff className="w-4 h-4" />
              <span>DISCONNECT</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>ICE: <strong className="text-emerald-400">Connected</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
