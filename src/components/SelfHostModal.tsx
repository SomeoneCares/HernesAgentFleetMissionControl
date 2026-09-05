import React, { useState } from 'react';
import { 
  Server, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Globe, 
  FolderArchive,
  Boxes
} from 'lucide-react';

interface SelfHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SelfHostModal: React.FC<SelfHostModalProps> = ({ isOpen, onClose }) => {
  const [activeRecipe, setActiveRecipe] = useState<'docker' | 'compose' | 'nginx' | 'instant' | 'offline'>('docker');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const dockerfileSnippet = `# Stage 1: Build the static web app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve static files with ultra-lightweight Nginx (no backend servers)
FROM nginx:alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

  const dockerRunSnippet = `# 1. Build the self-contained container
docker build -t hermes-mission-control .

# 2. Run anywhere on port 8080 (zero external dependencies)
docker run -d --name hermes-portal -p 8080:80 --restart unless-stopped hermes-mission-control

# Visit: http://localhost:8080`;

  const dockerComposeSnippet = `version: "3.8"

services:
  hermes-mission-control:
    image: hermes-mission-control:latest
    build: .
    container_name: hermes_portal
    ports:
      - "8080:80"
    restart: unless-stopped
    # Zero database or backend services required!
    # Pure static high-performance edge web application`;

  const nginxConfSnippet = `server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Single Page App routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip & caching compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}`;

  const caddyfileSnippet = `:8080 {
    root * /path/to/dist
    file_server
    try_files {path} /index.html
}`;

  const instantLocalSnippet = `# Option A: Python 3 (built-in on almost any Linux/Mac)
npm run build
python3 -m http.server 8080 -d dist

# Option B: Node zero-install runner
npm run build
npx serve -s dist -l 8080

# Option C: Busybox (embedded homelab / router)
busybox httpd -f -p 8080 -h dist`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0c101a] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden text-white font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                Self-Host & Deployment Center
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-semibold">
                  0 EXTRA SERVERS NEEDED
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hermes Mission Control is 100% self-contained. Deploy anywhere with pure static web hosting.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all border border-white/[0.06]"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero Extra Server Guarantees Callout */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 mb-6 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-white mb-0.5 flex items-center gap-2">
              <span>Pure Client-Side Architecture Guarantee</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-400/10 text-emerald-300">
                OFFLINE READY
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              You do <strong className="text-white">not need to install backend databases (Postgres, MongoDB)</strong> or background servers (Python, Node daemons). All mission control tasks, agent fleet routing, ledger tokens, chat messages, audio files, and telemetry state run natively in-browser with persistent storage.
            </p>
          </div>
        </div>

        {/* Recipe Segmented Tabs */}
        <div className="flex items-center gap-2 pb-3 mb-4 overflow-x-auto border-b border-white/[0.06]">
          <button
            onClick={() => setActiveRecipe('docker')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeRecipe === 'docker'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>1. Docker Container</span>
          </button>

          <button
            onClick={() => setActiveRecipe('compose')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeRecipe === 'compose'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. Docker Compose / Portainer</span>
          </button>

          <button
            onClick={() => setActiveRecipe('nginx')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeRecipe === 'nginx'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. Nginx / Caddy Static</span>
          </button>

          <button
            onClick={() => setActiveRecipe('instant')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeRecipe === 'instant'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Instant 10s Run</span>
          </button>

          <button
            onClick={() => setActiveRecipe('offline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
              activeRecipe === 'offline'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>5. Air-Gapped / Offline</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="max-h-[50vh] overflow-y-auto pr-1 font-mono text-xs">
          {activeRecipe === 'docker' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-slate-300">
                  <span className="font-semibold text-white">Dockerfile (Multi-Stage Alpine Nginx, &lt;25MB footprint)</span>
                  <button
                    onClick={() => copyToClipboard('dockerfile', dockerfileSnippet)}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 transition-colors"
                  >
                    {copiedKey === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'dockerfile' ? 'Copied' : 'Copy Dockerfile'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                  {dockerfileSnippet}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 text-slate-300">
                  <span className="font-semibold text-white">Quick Terminal Command</span>
                  <button
                    onClick={() => copyToClipboard('dockerRun', dockerRunSnippet)}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 transition-colors"
                  >
                    {copiedKey === 'dockerRun' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'dockerRun' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                  {dockerRunSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeRecipe === 'compose' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1.5 text-slate-300">
                <span className="font-semibold text-white">docker-compose.yml (Homelab / Portainer / Unraid)</span>
                <button
                  onClick={() => copyToClipboard('compose', dockerComposeSnippet)}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 transition-colors"
                >
                  {copiedKey === 'compose' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'compose' ? 'Copied' : 'Copy docker-compose.yml'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                {dockerComposeSnippet}
              </pre>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 text-[11px]">
                💡 Simply run <code className="text-cyan-300">docker compose up -d</code> in your project directory. It requires no background database containers, redis queues, or volume bindings!
              </div>
            </div>
          )}

          {activeRecipe === 'nginx' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 text-slate-300">
                  <span className="font-semibold text-white">Nginx Web Server Config (nginx.conf)</span>
                  <button
                    onClick={() => copyToClipboard('nginx', nginxConfSnippet)}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 transition-colors"
                  >
                    {copiedKey === 'nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'nginx' ? 'Copied' : 'Copy Nginx'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                  {nginxConfSnippet}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 text-slate-300">
                  <span className="font-semibold text-white">Caddy Server Config (Caddyfile)</span>
                  <button
                    onClick={() => copyToClipboard('caddy', caddyfileSnippet)}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 transition-colors"
                  >
                    {copiedKey === 'caddy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'caddy' ? 'Copied' : 'Copy Caddyfile'}</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                  {caddyfileSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeRecipe === 'instant' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1.5 text-slate-300">
                <span className="font-semibold text-white">Instant 10-Second Local Run (Zero Setup)</span>
                <button
                  onClick={() => copyToClipboard('instant', instantLocalSnippet)}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 transition-colors"
                >
                  {copiedKey === 'instant' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'instant' ? 'Copied' : 'Copy Commands'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.08] text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                {instantLocalSnippet}
              </pre>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 text-[11px]">
                💡 The output folder <code className="text-cyan-300">dist/</code> contains 100% standard static assets (HTML, CSS, JS). You can double-click it, put it on a thumb drive, or upload to any static hosting provider (GitHub Pages, Cloudflare Pages, Vercel, Netlify, AWS S3).
              </div>
            </div>
          )}

          {activeRecipe === 'offline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h3 className="font-semibold text-white text-sm">Air-Gapped & Offline Sovereign Operation</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Hermes Mission Control is designed for strict operational security. All JavaScript bundles, stylesheets, and local storage mechanisms function without requiring external network pings:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
                  <li><strong className="text-slate-200">No External Server Phoning:</strong> No telemetry tracking or third-party auth callbacks.</li>
                  <li><strong className="text-slate-200">Local Browser State:</strong> Agent configurations, Kanban task states, and chat threads remain encrypted and stored strictly in your browser session.</li>
                  <li><strong className="text-slate-200">Zero Vulnerability Surface:</strong> Because there are no listening backend ports or exposed API daemon sockets, attack surface is reduced to zero.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for production: run <code className="text-cyan-300">npm run build</code> to generate your static distribution.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold transition-all text-xs font-mono"
            type="button"
          >
            CLOSE WINDOW
          </button>
        </div>
      </div>
    </div>
  );
};
