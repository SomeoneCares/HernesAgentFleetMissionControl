import React from 'react';
import { useCluster } from '../context/ClusterContext';

export const Footer: React.FC = () => {
  const { portalSettings } = useCluster();
  const disclaimer = portalSettings?.branding?.footerDisclaimer || 'HERMES PROTOCOL // AUTONOMOUS AGENT ORCHESTRATION';
  const region = portalSettings?.connection?.clusterRegion || 'US-EAST-CORE-01';

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#07090e]/90 backdrop-blur-xl py-6 text-xs font-mono text-slate-400 mt-auto">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span>© {new Date().getFullYear()} {disclaimer}</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">CLUSTER REGION: {region}</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4edea3] animate-pulse"></span>
          <span>TELEMETRY STREAM CONNECTED & SYNCHRONIZED</span>
        </div>
      </div>
    </footer>
  );
};
