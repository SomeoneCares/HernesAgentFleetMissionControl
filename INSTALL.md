# Hermes Mission Control — Installation & Multi-Fleet Deployment Guide

This guide details how to install, configure, and host **Hermes Mission Control** directly on your **Hermes Agent Server**, including multi-fleet selection, custom themes, cyber pets, custom UI plugins, profile photos, and WebRTC real-time comms.

---

## Table of Contents
1. [Overview & Prerequisites](#overview--prerequisites)
2. [Option 1: Direct Build & Native Node/Systemd Service](#option-1-direct-build--native-nodesystemd-service)
3. [Option 2: High-Performance Production Nginx Reverse Proxy](#option-2-high-performance-production-nginx-reverse-proxy)
4. [Option 3: Containerized Docker & Docker Compose Deployment](#option-3-containerized-docker--docker-compose-deployment)
5. [Multi-Fleet Partitioning on a Single Host](#multi-fleet-partitioning-on-a-single-host)
6. [Configuring Themes, Cyber Pets, Plugins & Profile Photos](#configuring-themes-cyber-pets-plugins--profile-photos)
7. [Starting WebRTC Real-Time Calls in Chat](#starting-webrtc-real-time-calls-in-chat)
8. [Git Synchronization & Pushing to GitHub](#git-synchronization--pushing-to-github)

---

## 1. Overview & Prerequisites

Hermes Mission Control compiles down to an ultra-fast, zero-runtime-overhead static application (HTML5, React 18, Tailwind CSS, TypeScript) served alongside your existing Hermes Agent runtime.

- **Node.js**: v18.0.0+ (v20 LTS recommended) or **Bun** v1.0+
- **Memory**: Minimum 512 MB RAM (1 GB recommended)
- **Disk Space**: ~250 MB for dependencies and build artifacts
- **Open Ports**: 3000 (default dev/app port) or 80/443 (via Nginx reverse proxy)

---

## 2. Option 1: Direct Build & Native Node/Systemd Service

Best for bare-metal VPS or running on the same Linux host as your Hermes Agent Python/Node process.

### Step 1: Clone or Copy the Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/hermes-mission-control.git
cd hermes-mission-control
```

### Step 2: Install Dependencies & Build
```bash
# Using npm
npm install
npm run build

# Or using Bun (ultra-fast)
bun install
bun run build
```
This produces optimized production assets inside the `dist/` directory.

### Step 3: Serve Using Static Server or Preview
```bash
# Test preview immediately on port 3000
npm run preview -- --host 0.0.0.0 --port 3000
```

### Step 4: Run as a Persistent Systemd Background Daemon
Create a systemd unit file at `/etc/systemd/system/hermes-ui.service`:
```ini
[Unit]
Description=Hermes Mission Control Portal
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/hermes-mission-control
ExecStart=/usr/bin/npx serve -s dist -l 3000
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable hermes-ui
sudo systemctl start hermes-ui
sudo systemctl status hermes-ui
```

---

## 3. Option 2: High-Performance Production Nginx Reverse Proxy

Best for production deployments requiring SSL/TLS encryption, custom domains, and zero-latency WebSocket/WebRTC forwarding.

### Step 1: Install Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### Step 2: Copy Static Files to Web Root (or Proxy Port 3000)
```bash
# Option A: Direct static serving
sudo mkdir -p /var/www/hermes-mission-control
sudo cp -r /home/ubuntu/hermes-mission-control/dist/* /var/www/hermes-mission-control/
sudo chown -R www-data:www-data /var/www/hermes-mission-control
```

### Step 3: Configure Nginx Site
Create `/etc/nginx/sites-available/hermes`:
```nginx
server {
    listen 80;
    server_name hermes.yourdomain.com;

    # Static UI Files
    root /var/www/hermes-mission-control;
    index index.html;

    # Gzip Compression for Fast Loading
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy to Hermes Agent API on localhost:8000
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Proxy WebSocket / WebRTC Signaling Bus
    location /ws {
        proxy_pass http://127.0.0.1:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the configuration and reload:
```bash
sudo ln -s /etc/nginx/sites-available/hermes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Secure with Let's Encrypt SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d hermes.yourdomain.com
```

---

## 4. Option 3: Containerized Docker & Docker Compose Deployment

Best for containerized infrastructure, Docker Swarm, Kubernetes, or multi-tenant server configurations.

### Dockerfile
Save this as `Dockerfile` in the root directory:
```dockerfile
# Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve Phase with Nginx Alpine
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  hermes-mission-control:
    build: .
    container_name: hermes-mission-control
    restart: unless-stopped
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 5s
      retries: 3
```

Run with:
```bash
docker compose up -d --build
```
Access the dashboard at `http://<YOUR_SERVER_IP>:3000`.

---

## 5. Multi-Fleet Partitioning on a Single Host

When running multiple agent fleets on the same Hermes server instance:

1. **Top Navigation Dropdown**: Click the Fleet Selector in the top bar to switch between:
   - **All Fleets (Federated Aggregate)**: View all clusters, agents, and pipelines across the entire host.
   - **Individual Fleets**: Partition view to **Alpha Core Fleet**, **Data Ingestion Fleet**, **Security Sentinel Fleet**, or **DevOps Swarm**.
2. **Partition New Fleet**: Navigate to **Agents Fleet** tab and click **"Partition New Fleet"**. Define:
   - Fleet Name & Codename (e.g. `FLEET-FINANCIAL-ANALYSIS`)
   - Max Agent Concurrency
   - Designated Host Node & Port
   - Chromatic Fleet Color Badge
3. **Agent Relocation**: On any agent card in the **Agents Fleet** tab, use the inline dropdown to reassign an agent from one fleet partition to another instantly without restarting the server.

---

## 6. Configuring Themes, Cyber Pets, Plugins & Profile Photos

### A. Theme Designer & Curated Skins
- Click the **Palette icon** in the top navigation bar to open the Theme Studio.
- Choose from **6 curated skins** (Hermes Cyber, Tactical Emerald, Solar Amber, Sunset Synthwave, OLED Monolith, Alpine Daylight).
- Or click the **Theme Designer** tab to customize:
  - Primary Accent Color & Secondary Glow Tint (RGB color picker)
  - Base Background and Container Card Tint
  - Glow Intensity (Subtle, Medium, High, Ultra Neon)
  - Glassmorphic Blur vs. Opaque surfaces
  - Display Font Scaling (Compact Dense, Standard, Comfortable)

### B. Cyber Pet Companion
- Click the **Pet icon** in the top navigation bar or click the floating pet in the bottom-right HUD.
- Customize:
  - **Species**: Hermes Falcon (🦅), Quantum Neko (🐱), Synth Wyrm (🐉), Sentry Drone (🤖), or K9-Cerberus (🐕)
  - **Accessories**: Holo Visor (🥽), Cyber Halo (✨), Twin Jetpack (🚀), Pixel Crown (👑), DJ Headset (🎧)
  - **Aura Color**: Real-time glow matching your theme
  - **Chimes & Haptics**: Pure sine/triangle tone synthesizer powered by the Web Audio API
  - **Interactions**: Feed, pet, and click for simulated telemetry remarks.

### C. Custom UI Plugins & CSS Injection
- Click the **Plugins icon** (Puzzle piece) in the top navbar.
- Toggle pre-installed plugins:
  - *Matrix Digital Rain Layer*
  - *Quantum Audio Synthesizer*
  - *Real-time Token Burn & Gas Ticker*
  - *Quake Dropdown Terminal HUD*
- Inject custom runtime CSS directly through the embedded syntax-highlighted editor.

### D. Adding Profile Photos (Operator & Agents)
- **Operator Profile**: Click your profile badge in the top right (`OP-7740`) to open the Operator Profile Modal. Upload a photo from disk or enter any direct image URL.
- **Agent Portraits**: In the **Agents Fleet** tab, hover over any agent's portrait icon to see the camera badge. Click to upload a custom image or choose from high-resolution AI agent avatar presets.

---

## 7. Starting WebRTC Real-Time Calls in Chat

1. Navigate to the **Comms & Chat** tab.
2. Select any active agent channel (e.g. Hermes Prime, Chronos, Aegis).
3. Click the cyan **"WebRTC Call"** button in the chat header.
4. The WebRTC Call Suite opens:
   - Automatically connects to your local webcam and microphone via `navigator.mediaDevices.getUserMedia`.
   - Real-time audio frequency visualizer powered by Web Audio `AnalyserNode`.
   - Fallback simulated telemetry mode if camera hardware is disabled or blocked in iframe permissions.
   - Controls to toggle camera, mute mic, switch layout, and disconnect.

---

## 8. Git Synchronization & Pushing to GitHub

To push your latest configuration and updates to GitHub:

```bash
# Check status
git status

# Stage all files
git add -A

# Commit changes
git commit -m "feat: multi-fleet support, theme designer, cyber pet, plugins, profile photos, and webrtc comms"

# Set main branch and push to your remote repository
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/hermes-mission-control.git
git push -u origin main
```

If updating an existing repository:
```bash
git add -A
git commit -m "update: install guide, webrtc modal, and fleet management"
git push origin main
```

---

*Mission Control v4.2 // Hermes Autonomous Agent Operations*
