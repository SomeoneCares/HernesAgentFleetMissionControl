# 🛸 Hermes Autonomous Agent Mission Control • Feature Specification & System Guide

This document provides a comprehensive, component-by-component architectural and functional reference for **Hermes Mission Control** — a cybernetic command portal engineered for orchestrating, monitoring, and debugging distributed autonomous AI agent fleets, task pipelines, model routing, reasoning streams, and multi-format artifact libraries.

---

## 📑 Table of Contents

1. [Executive Architecture & System Design](#1-executive-architecture--system-design)
2. [Global Navigation & Persistent Layout](#2-global-navigation--persistent-layout)
   - [Top Aerospace Navigation Bar](#top-aerospace-navigation-bar)
   - [Fleet Selector & Host Partition Dropdown](#fleet-selector--host-partition-dropdown)
   - [Interactive Cyber Pet Companion (HUD)](#interactive-cyber-pet-companion-hud)
   - [Aerospace Command Footer](#aerospace-command-footer)
3. [Tab 1: Overview & Telemetry Matrix](#3-tab-1-overview--telemetry-matrix)
   - [Telemetry Summary Metrics](#telemetry-summary-metrics)
   - [Cluster VRAM & Hardware Allocation Gauges](#cluster-vram--hardware-allocation-gauges)
   - [Real-Time Event Stream & Activity Feed](#real-time-event-stream--activity-feed)
   - [Fleet Summary & Node Status](#fleet-summary--node-status)
   - [Active Agent Preview Grid](#active-agent-preview-grid)
   - [Quick Operations Action Bar](#quick-operations-action-bar)
4. [Tab 2: Autonomous Agent Fleets](#4-tab-2-autonomous-agent-fleets)
   - [Fleet Partition Bar & Host Management](#fleet-partition-bar--host-management)
   - [Agent Roster Cards & Workload Specs](#agent-roster-cards--workload-specs)
   - [Agent Inspection & Customization Modals](#agent-inspection--customization-modals)
     - [Soul Prompt & Core Directives Inspector](#soul-prompt--core-directives-inspector)
     - [Vector Memory & Episodic Context Manager](#vector-memory--episodic-context-manager)
     - [Avatar Photo & Biometric Customizer](#avatar-photo--biometric-customizer)
     - [Deep Telemetry & Spec Detail Modal](#deep-telemetry--spec-detail-modal)
     - [Agent Deployment Modal](#agent-deployment-modal)
5. [Tab 3: Autonomous Task Kanban](#5-tab-3-autonomous-task-kanban)
   - [Kanban Pipeline Columns (Todo, In Progress, Done)](#kanban-pipeline-columns)
   - [Task Card Anatomy & Metrics](#task-card-anatomy--metrics)
   - [New Task Creation Modal](#new-task-creation-modal)
   - [Search, Fleet Filtering & Priority Sorting](#search-fleet-filtering--priority-sorting)
6. [Tab 4: Chat Comms & Agent Bus](#6-tab-4-chat-comms--agent-bus)
   - [Agent Channels & Communications Sidebar](#agent-channels--communications-sidebar)
   - [Active Agent Header & Model Switcher](#active-agent-header--model-switcher)
   - [Thinking & Reasoning Stream (AgentThoughtViewer)](#thinking--reasoning-stream-agentthoughtviewer)
   - [Autonomous Step-by-Step HUD & Progress Tracker](#autonomous-step-by-step-hud--progress-tracker)
   - [Tool Execution Viewer](#tool-execution-viewer)
   - [Code Snippet & Multi-Attachment Display](#code-snippet--multi-attachment-display)
   - [Audio Voice Notes & Waveform Player](#audio-voice-notes--waveform-player)
   - [Simulated WebRTC Video & Audio Call Modal](#simulated-webrtc-video--audio-call-modal)
   - [Rich Message Input Console & Fast Command Chips](#rich-message-input-console--fast-command-chips)
7. [Tab 5: Content Library & Artifacts](#7-tab-5-content-library--artifacts)
   - [Artifact Filtering (Extensions & Storage Tier)](#artifact-filtering)
   - [Multi-Format Deep Viewers](#multi-format-deep-viewers)
     - [Markdown & Documentation Viewer](#markdown--documentation-viewer)
     - [Code & Script Viewer](#code--script-viewer)
     - [Multi-Sheet Interactive Spreadsheet Viewer](#multi-sheet-interactive-spreadsheet-viewer)
     - [Slide Deck & Presentation Viewer](#slide-deck--presentation-viewer)
     - [Multi-Page Structured Document Viewer](#multi-page-structured-document-viewer)
     - [High-Resolution Image & EXIF Telemetry Inspector](#high-resolution-image--exif-telemetry-inspector)
   - [Vectorization & Cache Controls](#vectorization--cache-controls)
8. [Cross-Cutting Ancillary Modals](#8-cross-cutting-ancillary-modals)
   - [Connect Live Hermes Profile & Fleet Modal](#connect-live-hermes-profile--fleet-modal)
   - [Partition New Fleet Modal](#partition-new-fleet-modal)
   - [Cross-Fleet Routing & Dynamic Handoff Modal](#cross-fleet-routing--dynamic-handoff-modal)
   - [Aerospace Interactive CLI Terminal Drawer](#aerospace-interactive-cli-terminal-drawer)
   - [Skin & Visual Theme Designer Modal](#skin--visual-theme-designer-modal)
   - [Self-Host & Zero-Server Deployment Modal](#self-host--zero-server-deployment-modal)
   - [Cyber Pet Companion Config Modal](#cyber-pet-companion-config-modal)
   - [Operator Profile & Security Clearance Modal](#operator-profile--security-clearance-modal)
9. [Detailed Breakdown of Every Setting](#9-detailed-breakdown-of-every-setting)
   - [9.1 Connection Settings](#91-connection-settings)
   - [9.2 Storage & Vector Index Settings](#92-storage--vector-index-settings)
   - [9.3 Portal Branding & White-Labeling](#93-portal-branding--white-labeling)
   - [9.4 Preferences & Operational Thresholds](#94-preferences--operational-thresholds)
   - [9.5 Plugins & UI Extensions](#95-plugins--ui-extensions)
   - [9.6 Backup, Snapshots & Disaster Recovery](#96-backup-snapshots--disaster-recovery)
10. [Hermes Daemon REST/WebSocket API Reference](#10-hermes-daemon-restwebsocket-api-reference)

---

## 1. Executive Architecture & System Design

Hermes Mission Control is designed on a **dual-plane operational architecture**:
1. **Frontend Presentation & Telemetry Plane (React 18 + Vite + Tailwind CSS)**:
   - Renders low-latency operational interfaces with cybernetic aerospace aesthetics.
   - Maintains local reactive states, WebSocket heartbeat connections, and event queues.
   - Supports 6 pre-tuned color themes (Cyber Obsidian, Tactical Emerald, Solar Amber, Sunset Synth, OLED Monolith, Alpine Daylight).
2. **Hermes Gateway & Daemon Plane (HTTP/REST / WebSocket / gRPC-Web / Unix Socket)**:
   - Binds directly to the local or remote Hermes Agent instance (default port `8642`).
   - Discovers agent profiles (`/v1/profiles`), fleets (`/v1/fleets`), models (`/v1/models`), tools (`/v1/toolsets`), and skills (`/v1/skills`).
   - Streams autonomous completions, internal reasoning `<think>` steps, tool invocations, and live agent status.

---

## 2. Global Navigation & Persistent Layout

### Top Aerospace Navigation Bar
- **Brand Emblem & Callsign**: Displays the customized portal logo (one of 10 cybernetic vector icons or custom SVG) paired with dynamic portal name (e.g. `HERMES`) and version badge (e.g. `OS 4.2`).
- **Live Connection Pulse**: Real-time heartbeat beacon with latency indicator (e.g. `12ms`) and connection status (`CONNECTED`, `RECONNECTING`, `DISCONNECTED`, `LOCAL_STANDALONE`).
- **Tab Switcher Strip**: Fast navigation between the 5 primary tabs with keybindings and visual indicators:
  - `Overview` (System telemetry & health)
  - `Agents` (Fleet rosters & soul configurations)
  - `Tasks` (Autonomous Kanban pipeline)
  - `Chat` (Real-time agent bus & thinking viewer)
  - `Library` (Generated artifacts & multi-format documents)
- **Fleet Selector Dropdown Trigger**: Displays current fleet codename and provides access to the partition switcher.
- **Header Utility Tools**:
  - **Skin Selector Icon**: Opens the 6-preset visual theme customizer.
  - **Interactive CLI Icon**: Opens the sliding aerospace terminal drawer (`~`).
  - **Self-Host Guide Icon**: Opens the Docker/systemd 0-server deployment manual.
  - **Operator Avatar & Callsign**: Opens the Operator Profile & Clearance modal.
  - **Portal Settings Gear (`Alt+S` or `Cmd+,`)**: Opens the comprehensive 6-category configuration modal.

### Fleet Selector & Host Partition Dropdown
- **Active Fleet Identification**: Shows currently active fleet with color swatch, node cluster, and total hosted fleets.
- **Sync Daemon Button**: Directly queries the Hermes Gateway to discover newly created profiles or swarms.
- **Fleet List**: Scrollable list of all partitioned fleets with:
  - Fleet name, purpose, and codename badge.
  - Live Hermes indicator (`LIVE HERMES` vs `MOCK`).
  - VRAM allocated and agent count.
  - Active checkmark indicator.
  - Individual fleet delete button (`Trash2`).
- **Quick Action Triggers**:
  - `+ Connect Hermes Profile / Fleet`: Launches profile discovery/registration.
  - `Cross-Fleet Routing & Rules`: Opens multi-fleet routing strategies.
  - `Partition New Fleet`: Creates an isolated workspace partition.
  - `Host & Daemon Settings`: Direct link to connection settings.

### Interactive Cyber Pet Companion (HUD)
- **Docked Aerospace Companion**: Sits docked on the bottom right or left corner of the screen.
- **5 Cybernetic Species**: Falcon (Aerospace scout), Cat (Quantum feline), Wyrm (Data serpent), Drone (Autonomous quad-rotor), K9 (Security hound).
- **5 Dynamic Moods**: Happy, Alert, Curious, Sleeping, Hacking.
- **Stats Gauges**: Real-time interactive Happiness and Energy/Hunger meters.
- **Interaction Capabilities**: Click to pet, feed data packets, trigger audio chimes, or open companion configuration.

### Aerospace Command Footer
- **Host Specs & Node Cluster**: Real-time cluster hostname, node region, and memory footprint.
- **Gateway Server Status**: Target host URL and gateway protocol.
- **Direct Settings Trigger**: Clickable gear link to open portal configuration.
- **Custom Legal / Operational Disclaimer**: User-customizable copyright or mission confidentiality notice.

---

## 3. Tab 1: Overview & Telemetry Matrix

The Overview tab provides a high-density, real-time command dashboard monitoring cluster health, GPU compute allocation, and swarm event activity.

### Telemetry Summary Metrics
- **Active Agents Count**: Number of agents online versus total deployed.
- **Swarm Compute Allocation**: Percentage of cluster computational budget actively utilized.
- **Throughput TPS**: Aggregate tokens generated per second across all active LLMs.
- **Average Latency**: Network round-trip and inferencing time in milliseconds.
- **SLA Compliance Rate**: Percentage of autonomous tasks completed within target SLA deadlines.

### Cluster VRAM & Hardware Allocation Gauges
- Visual hardware meters tracking allocated VRAM across host GPU nodes (e.g. Node Alpha RTX 4090, Node Beta H100).
- Per-node temperature, memory headroom, and saturation percentages.
- Alert indicators triggered when headroom drops below safe operational thresholds.

### Real-Time Event Stream & Activity Feed
- **Live Event Log**: Streaming list of cluster actions categorized by:
  - `AGENT`: Autonomous state transitions, assignments, and completions.
  - `MODEL`: Token consumption bursts, context window utilization, and inference calls.
  - `SECURITY`: Tool execution permissions, guardrail interventions, and auth checks.
  - `GATEWAY`: Heartbeats, connection pings, and profile sync events.
  - `TOOL`: Bash commands, filesystem I/O, web browsing, and code compilation.
- **Event Controls**: Filter events by category, search text, or clear stream history.

### Fleet Summary & Node Status
- Breakdown of all partitioned fleets running on the host.
- Per-fleet health status (`ACTIVE`, `STANDBY`, `DEGRADED`).
- Node cluster assignment and active model engine.

### Active Agent Preview Grid
- Miniature visual cards displaying agents currently in `BUSY` or `ONLINE` status.
- Current task PID, progress percentage bar, and ETA countdown.

### Quick Operations Action Bar
- **Deploy Agent**: Launches agent deployment wizard.
- **Run Benchmark**: Executes cluster latency and throughput stress test.
- **Broadcast Signal**: Emits an operational directive across all active agent buses.
- **Partition Fleet**: Fast shortcut to create a new fleet partition.
- **New Task**: Quick task creation modal.

---

## 4. Tab 2: Autonomous Agent Fleets

The Agents tab provides fleet partition controls, agent roster management, and granular inspection of agent prompts, vector memories, and tool permissions.

### Fleet Partition Bar & Host Management
- **Multi-Fleet Switcher Strip**: Tabbed view allowing operators to filter the workspace to a specific fleet or select `All Fleets`.
- **Live Daemon Badge**: Visual indicator showing if real Hermes daemon profiles are connected.
- **+ Connect Hermes Profile Button**: Launches auto-discovery or manual registration.
- **Sync Daemon Button**: Instant probe of `/v1/profiles` and `/v1/fleets`.
- **Partition New Fleet Button**: Creates new fleet with custom VRAM and node bindings.
- **Active Fleet Specs Pill**: Shows codename, node cluster, VRAM headroom, default engine, and quick delete button.

### Agent Roster Cards & Workload Specs
Each card represents a deployed autonomous agent:
- **Header**: Avatar photo / cybernetic icon, agent callsign, role classification, and status badge (`ONLINE`, `BUSY`, `MONITORING`, `GUARD ACTIVE`, `STANDBY`).
- **Live Profile Tag**: Bright emerald `LIVE HERMES` badge for real connected daemon profiles.
- **Model Engine & Latency**: Associated LLM ID and live ping latency.
- **Context Window Meter**: Visual gauge of tokens used versus maximum model context (e.g. `124k / 200k`).
- **Active Workload HUD**: Displays task title, operating process ID (`PID`), and live progress bar.
- **Assigned Tools & Skills**: Chips representing granted capabilities (e.g. `bash`, `python_repl`, `web_search`, `fs_write`).
- **Action Toolbar**:
  - **Soul Prompt Inspector**: View and edit system personality and directives.
  - **Memory Vector Store**: Manage episodic and procedural long-term memory items.
  - **Avatar Photo Customizer**: Upload custom avatar or select from library.
  - **Fleet Reassignment**: Move agent between partitioned fleets.
  - **Deep Detail Modal**: Comprehensive operational breakdown.

### Agent Inspection & Customization Modals

#### Soul Prompt & Core Directives Inspector (`AgentSoulModal`)
- View and edit the fundamental system prompt governing the agent's behavior.
- Configure tone, strictness, safety guardrails, and behavioral boundaries.
- Live token counter estimating prompt overhead.

#### Vector Memory & Episodic Context Manager (`AgentMemoryModal`)
- Browse stored memory vectors categorized into:
  - *Core Principles*
  - *Episodic Experience*
  - *Procedural Knowledge*
  - *Working Context*
  - *Factoid & System*
- Inspect importance weights (0.1 to 1.0), token counts, last access timestamps, and tags.
- Search memories by keyword or inject new procedural rules directly.
- Prune obsolete or low-importance memories to conserve context space.

#### Avatar Photo & Biometric Customizer (`AgentPhotoModal`)
- Set custom agent avatar via image URL, uploaded file, or choose from aerospace presets.
- Real-time preview with circular cybernetic border.

#### Deep Telemetry & Spec Detail Modal (`AgentDetailModal`)
- Full technical dossier of the agent: uptime, SLA compliance percentage, memory architecture, full assigned task backlog, and tool execution logs.

#### Agent Deployment Modal (`DeployAgentModal`)
- Deploy new agents to any fleet partition.
- Configure name, role, codename, primary model, initial memory allocations, and granted toolsets.

---

## 5. Tab 3: Autonomous Task Kanban

The Tasks tab provides an autonomous workflow board tracking distributed jobs across agents and fleets.

### Kanban Pipeline Columns
- **TODO / BACKLOG**: Tasks queued for execution with priority tags and SLAs.
- **IN PROGRESS / ACTIVE**: Tasks currently being worked on by an assigned agent with progress telemetry.
- **COMPLETED / DONE**: Finished tasks with verified outputs and SLA compliance confirmation.

### Task Card Anatomy & Metrics
- **Task Hash ID**: Unique deterministic cryptographic hash (e.g. `#TSK-8924A`).
- **Title & Description**: Plaintext objective and parameters.
- **Fleet Assignment Badge**: Shows which fleet partition owns the task.
- **Priority Indicator**:
  - `P1 · CRITICAL` (Red with pulsing beacon)
  - `P2 · ELEVATED` (Amber)
  - `P3 · NORMAL` (Cyan/Slate)
- **Assigned Agent**: Avatar and callsign of the handling agent.
- **Subtasks Progress**: Visual completion bar showing completed sub-items (e.g. `3/5 subtasks`).
- **SLA Countdown Timer**: Live SLA clock with icon indicator (`fire` for critical, `time` for standard, `verified` for completed on time).
- **Quick Transition Buttons**: Advance task from Todo → In Progress → Done.

### New Task Creation Modal (`NewTaskModal`)
- Generate custom tasks with auto-generated hash IDs.
- Select target fleet and assigned agent.
- Assign priority level (`P1`, `P2`, `P3`).
- Define target SLA duration.
- Add structured checklist of subtasks.

### Search, Fleet Filtering & Priority Sorting
- Real-time search bar querying title, hash, and metadata.
- Filter Kanban view by specific fleet partition.
- Filter by priority tier or assigned agent.

---

## 6. Tab 4: Chat Comms & Agent Bus

The Chat tab is the central human-to-agent and inter-agent communication hub, featuring live thinking visualization, tool execution auditing, and WebRTC calling.

### Agent Channels & Communications Sidebar
- **Search Channels**: Fast filter for agent conversation threads.
- **+ Connect Hermes Profile Button**: Shortcut to connect real daemon profiles.
- **Sync Daemon Button**: Refresh profiles from the gateway.
- **Fleet Filter Dropdown**: Narrow the sidebar channel list to specific fleets.
- **Agent Thread List**:
  - Shows agent name, avatar, and active role.
  - Live status indicator dot.
  - `LIVE HERMES` badge for real connected profiles.
  - Current latency readout.

### Active Agent Header & Model Switcher
- **Agent Header**: Displays active agent avatar, callsign, fleet tag, and live connection status.
- **Active Model Dropdown**: Switch the underlying LLM engine in real-time (e.g. `hermes-agent`, `gemini-2.5-flash`, `deepseek-r1`, `claude-3.7-sonnet`, `llama-3.3-70b`).
- **Thinking Visibility Toggle Button**:
  - **Prominent purple toggle button**: `Thinking: Visible (ON)` / `Thinking: Hidden (OFF)`.
  - Global control to show or collapse the inner cognitive reasoning process across all agent messages.
- **WebRTC Call Launcher**: Opens the aerospace video/audio conference modal.
- **Clear Session / Flush Context**: Wipes conversational working memory for a fresh session context.

### Thinking & Reasoning Stream (`AgentThoughtViewer`)
Visualizes internal reasoning parsed from `<think>...</think>`, `<thought>`, or `reasoning_content` API payloads:
- **Header**: Pulsing neural brain icon, reasoning step count, duration in milliseconds, and total thinking token count.
- **View Modes**:
  - **Structured Reasoning**: Formatted step-by-step breakdown of deductions, strategy, and verification phases.
  - **Raw Stream Terminal**: Dark terminal view displaying the unparsed token-by-token thought chain with line numbers.
- **Copy Thought**: One-click clipboard copy of the entire reasoning chain.

### Autonomous Step-by-Step HUD & Progress Tracker
Displays multi-phase autonomous execution plans:
- Numbered sequential stages (e.g. Step 1: Clone Repo, Step 2: Run Security Audit, Step 3: Compile Binary).
- State indicators: `pending`, `running` (with spinner), `completed` (green check), or `failed` (red alert).

### Tool Execution Viewer (`ToolExecutionViewer`)
Audits every external capability invoked by the agent:
- Displays tool name (e.g. `bash_exec`, `web_scrape`, `git_commit`).
- Execution duration, payload size in KB, and unique call ID.
- Collapsible inspect panels for **Input Arguments (JSON)** and **Output Result (Stdout/Stderr)**.

### Code Snippet & Multi-Attachment Display
- Syntax-highlighted code viewer with file name header and copy button.
- Document and image attachment previews with SHA-256 verification hashes.

### Audio Voice Notes & Waveform Player
- Plays synthetic or recorded voice notes.
- Dynamic audio waveform visualization.
- Full text transcript accompanying the voice memo.

### Simulated WebRTC Video & Audio Call Modal (`WebRtcModal`)
- Cybernetic video conference window with active agent.
- Animated speech frequency visualizer and biometric scanning frame.
- Latency meter and secure aerospace call encryption indicator.

### Rich Message Input Console & Fast Command Chips
- Auto-expanding multiline input field.
- **Attachment Uploader**: Supports file and image uploads.
- **Voice Note Input**: Simulates or captures voice recordings.
- **Quick Action Chips**:
  - `/status` (Query agent health and pending queue)
  - `/summarize` (Condense active context)
  - `/test` (Run diagnostic test suite)
  - `/deploy` (Trigger autonomous deployment pipeline)
- Keyboard shortcuts: `Enter` to send, `Shift+Enter` for new line.

---

## 7. Tab 5: Content Library & Artifacts

The Content Library catalogs all documents, code, slide decks, datasets, and media generated by autonomous agents.

### Artifact Filtering
- **Extension Filters**: Filter by `MD`, `PY`, `JSON`, `PARQUET`, `YAML`, `PDF`, `CSV`, `DOCX`, `XLSX`, `PPTX`, `PNG`, `JPG`, `SVG`, `WEBP`.
- **Storage Tier Filters**:
  - `Vectorized` (Embedded in RAG index)
  - `In Cache` (Active hot cache memory)
  - `Cold Storage` (Archived to disk/IPFS/S3)
  - `HOT_MEMORY` (Loaded in active LLM context)

### Multi-Format Deep Viewers

#### Markdown & Documentation Viewer
- Full rendered markdown with styled headers, lists, blockquotes, and code blocks.
- View raw markdown source toggle.

#### Code & Script Viewer
- Syntax-highlighted Python, YAML, JSON, and Bash scripts.
- Displays total line count, SHA checksum, and copy button.

#### Multi-Sheet Interactive Spreadsheet Viewer
- Full multi-sheet table navigation (e.g. `Quarterly Metrics`, `Node Latency`).
- Formatted headers and scrollable row grids.

#### Slide Deck & Presentation Viewer
- Interactive slide carousel with slide counter.
- Slide titles, bullet lists, presenter notes, and visual architecture layout previews.

#### Multi-Page Structured Document Viewer
- Word/PDF page layout renderer.
- Displays document title, confidentiality classification, organization insignia, and paginated sections with embedded data tables.

#### High-Resolution Image & EXIF Telemetry Inspector
- Full-screen image preview.
- **Deep EXIF Telemetry**: Dimensions, color profile, camera/sensor type, aspect ratio, focal length, ISO, and exposure.
- Simulated RGB color histogram.

### Vectorization & Cache Controls
- One-click toggle to ingest artifact into the semantic vector index or remove it.
- Direct file download and raw content export.

---

## 8. Cross-Cutting Ancillary Modals

### Connect Live Hermes Profile & Fleet Modal (`ConnectHermesProfileModal`)
- **Auto-Discover Mode**: Probes `/v1/profiles`, `/v1/fleets`, and `/v1/models` on the configured Hermes server to detect and link real agent setups.
- **Manual Register Mode**: Register custom profile name, fleet codename tag, model backend, and description.
- **Purge Simulated Mockups Checkbox**: Automatically clears all placeholder agents and fleets so only the user's real Hermes agent and fleet are active.

### Partition New Fleet Modal (`CreateFleetModal`)
- Input fleet name, codename (e.g. `FLEET-DELTA`), and mission purpose.
- Select target hardware cluster node (e.g. `Localhost Node`, `Alpha H100 GPU`).
- Set VRAM allocation and default model engine.
- Choose fleet accent color swatch.

### Cross-Fleet Routing & Dynamic Handoff Modal (`FleetRoutingModal`)
- **5 Global Routing Strategies**:
  1. `intent-affinity`: Routes requests based on semantic match to agent specialization.
  2. `least-loaded`: Routes to the fleet with the lowest queue saturation.
  3. `round-robin`: Evenly distributes workload across available fleets.
  4. `priority-urgency`: Allocates P1 critical jobs to dedicated high-speed nodes.
  5. `context-window-fit`: Selects fleets hosting models with sufficient token headroom.
- **Routing Rules Table**: Custom IF/THEN rules matching keywords, priority levels, token budgets, or regex patterns to specific target fleets.
- **Autonomous Handoff Rules**: Triggers cross-fleet escalation when confidence drops below thresholds, context is exhausted, or errors repeat.

### Aerospace Interactive CLI Terminal Drawer (`CliModal`)
- Sliding terminal window with real command parser.
- Built-in commands:
  - `help`: Lists available terminal commands.
  - `status`: Outputs cluster health and agent uptime.
  - `fleet`: Lists partitioned fleets.
  - `agent`: Outputs agent roster and statuses.
  - `ping`: Measures latency to the Hermes gateway.
  - `sync`: Triggers gateway profile synchronization.
  - `purge`: Purges simulated mockup data.
  - `models`: Lists available LLM engines.
  - `clear`: Clears terminal screen.

### Skin & Visual Theme Designer Modal (`SkinSelectorModal`)
- 6 visual themes:
  1. `hermes-cyber` (Default Cyber Obsidian & Neon Cyan)
  2. `tactical-emerald` (Matrix / Terminal Phosphor Green)
  3. `solar-amber` (Neuromancer Industrial Amber & Gold)
  4. `sunset-synth` (Cyberpunk Synthwave Magenta & Violet)
  5. `oled-monolith` (Pitch Black OLED & Titanium Ice Blue)
  6. `alpine-daylight` (Crisp Architectural Executive White - Light Mode)
- Real-time swatch previews and live palette application.

### Self-Host & Zero-Server Deployment Modal (`SelfHostModal`)
- Instructions and scripts for self-hosting Hermes Mission Control anywhere:
  - Static SPA zero-dependency hosting.
  - One-line Docker Compose file.
  - Systemd service configuration for Linux hosts.
  - Environment variable reference.

### Cyber Pet Companion Config Modal (`CyberPetModal`)
- Choose pet species (Falcon, Cat, Wyrm, Drone, K9).
- Set companion callsign/name.
- Select cosmetic accessories (Visor, Halo, Jetpack, Crown, Headphones).
- Set aura glow color.
- Toggle audio interaction chimes and screen docking position.

### Operator Profile & Security Clearance Modal (`OperatorProfileModal`)
- Configure operator callsign, full name, operational role, and email.
- Set security authorization level (e.g. `Level-5 Fleet Commander`).
- Upload avatar photo or choose from aerospace presets.

---

## 9. Detailed Breakdown of Every Setting

Accessible via the gear icon, the `Alt+S` / `Cmd+,` keyboard shortcut, or the `/settings` and `#settings` URLs.

```
┌─────────────────────────────────────────────────────────────┐
│                   PORTAL SETTINGS MODAL                     │
├──────────────┬──────────────────────────────────────────────┤
│ 1. Connection│ Server URL, Protocol, Auth, Ping, Live Sync  │
│ 2. Storage   │ Library Path, IPFS, S3, Quotas, Vector Mem   │
│ 3. Branding  │ Callsign, Tagline, Org, Logo, Accent Colors  │
│ 4. Preference│ Default Fleet, Landing Tab, Retention, Sound │
│ 5. Plugins   │ Installed Add-ons, Custom CSS Live Editor    │
│ 6. Backup    │ Snapshot Export/Import, Schedules, Reset     │
└──────────────┴──────────────────────────────────────────────┘
```

### 9.1 Connection Settings
| Setting Name | Type / Values | Default | Purpose & Behavioral Impact |
| :--- | :--- | :--- | :--- |
| **Server URL** | `string` | `http://localhost:8642` | Endpoint address of the host running the Hermes Agent daemon. Supports localhost, LAN IP, or remote domain. |
| **Protocol** | `HTTP_REST`, `GRPC_WEB`, `WEBSOCKET`, `UNIX_SOCKET` | `HTTP_REST` | Transport protocol used for agent telemetry and streaming. WebSocket/gRPC enable zero-polling live updates. |
| **Auth Token** | `string` (Secret) | `""` | Bearer token passed in the `Authorization` header when connecting to secured Hermes gateways. |
| **Verify TLS** | `boolean` | `true` | Enforces valid SSL/TLS certificate chains on HTTPS connections. Can be toggled off for local self-signed setups. |
| **Cluster Region** | `string` | `local-edge-01` | Identifier tag assigned to the local node in multi-region telemetry aggregations. |
| **Heartbeat Ping** | Action / Button | `N/A` | Sends an immediate ping packet to the server to measure round-trip latency in milliseconds. |
| **Live Daemon Sync** | Action / Button | `N/A` | Directly queries `/v1/profiles`, `/v1/fleets`, and `/v1/models` on the server and maps them into the portal. |
| **Purge Mockup Data** | Action / Button | `N/A` | Removes all simulated demo agents, fleets, and tasks, leaving only verified live Hermes daemon entities. |
| **Restore Mockup Data**| Action / Button | `N/A` | Re-seeds the portal with demo data for sandbox exploration or offline demonstrations. |
| **Connection Guide** | Modal Trigger | `N/A` | Opens step-by-step CLI commands for launching the Hermes daemon with proper CORS flags. |

---

### 9.2 Storage & Vector Index Settings
| Setting Name | Type / Values | Default | Purpose & Behavioral Impact |
| :--- | :--- | :--- | :--- |
| **Library Folder Path** | `string` | `/var/hermes/artifacts` | Host filesystem directory where autonomous agents store generated artifacts and logs. |
| **IPFS Gateway URL** | `string` | `https://ipfs.io/ipfs/` | Decentralized storage gateway used to resolve and pin content-addressed artifacts. |
| **S3 Bucket Endpoint** | `string` | `""` | Optional S3-compatible cloud storage endpoint (AWS, MinIO, Cloudflare R2) for artifact offloading. |
| **Storage Quota Cap** | `number` (GB) | `250 GB` | Maximum local storage volume allocated before automated cache cleanup policies trigger. |
| **Auto-Purge Threshold**| `number` (Days) | `30 Days` | Lifespan for temporary cache files and raw stdout logs before deletion. |
| **Compress on Ingest** | `boolean` | `true` | Automatically compresses incoming text artifacts using Brotli/Gzip to save disk space. |
| **Vector Index Memory** | `number` (MB) | `2048 MB` | RAM allocated to the in-memory semantic vector embedding store for agent RAG retrieval. |

---

### 9.3 Portal Branding & White-Labeling
| Setting Name | Type / Values | Default | Purpose & Behavioral Impact |
| :--- | :--- | :--- | :--- |
| **Portal Name** | `string` | `HERMES` | Primary callsign displayed in the navigation header, browser tab title, and system exports. |
| **Portal Tagline** | `string` | `Autonomous Mission Control` | Subtitle displayed beside the portal name and in browser metadata. |
| **Organization Name** | `string` | `AERO-DEFENSE SWARM` | Displays the controlling enterprise or unit insignia tag. |
| **Version Badge** | `string` | `OS 4.2` | Tactical software build or release tag displayed in the navbar. |
| **Logo Icon Selection**| 10 Vector Icons | `Layers` | Choose between `Layers`, `Bot`, `Shield`, `Terminal`, `Flame`, `Sparkles`, `Orbit`, `Cpu`, `Network`, `Zap`. |
| **Custom Logo URL** | `string` | `""` | HTTPS URL to a custom SVG or PNG image that overrides the vector icon. |
| **Accent Hex Color** | `string` (Hex) | `#00f2fe` | Custom accent color applied across glows, borders, and brand badges. |
| **Footer Disclaimer** | `string` | Standard Notice | Custom legal, classification, or security warning rendered in the footer. |
| **Show Org Badge** | `boolean` | `true` | Toggle visibility of the organization tag in the top navigation bar. |

---

### 9.4 Preferences & Operational Thresholds
| Setting Name | Type / Values | Default | Purpose & Behavioral Impact |
| :--- | :--- | :--- | :--- |
| **Default Active Fleet**| Dropdown (`Fleet ID`) | `fleet-alpha-core` | The fleet automatically selected whenever the portal loads. |
| **Default Landing Tab** | `overview`, `agents`, `tasks`, `chat`, `library` | `overview` | The primary view presented when an operator opens the mission control portal. |
| **Telemetry Retention** | `number` (Events) | `2000` | Maximum number of real-time telemetry events preserved in the live buffer. |
| **Tactical Sound Alerts**| `boolean` | `true` | Audio chimes on P1 task creation, agent disconnects, or pet interactions. |
| **Auto-Rebalance Saturation**| `number` (%) | `85%` | Threshold at which the scheduler automatically routes tasks away from overloaded fleets. |
| **Refresh Interval** | `number` (Seconds) | `5 Sec` | Frequency of background polling when operating in HTTP/REST polling mode. |

---

### 9.5 Plugins & UI Extensions
| Feature | Type / Sub-view | Purpose & Behavioral Impact |
| :--- | :--- | :--- |
| **Installed Plugins** | Toggleable List | Enable or disable modular extensions categorized by `visual`, `audio`, `telemetry`, and `utility`. |
| **Plugin Config** | Nested Form | Customize parameters for plugins that expose configuration hooks. |
| **Custom CSS Editor** | Code Editor | Live stylesheet editor allowing operators to inject CSS rules overriding colors, fonts, or animations. |
| **Create Custom Plugin**| Modal Form | Define user-authored plugins with custom names, categories, and descriptions. |

---

### 9.6 Backup, Snapshots & Disaster Recovery
| Setting Name | Type / Values | Default | Purpose & Behavioral Impact |
| :--- | :--- | :--- | :--- |
| **Auto-Backup Schedule**| `OFF`, `HOURLY`, `EVERY_6_HOURS`, `DAILY`, `WEEKLY` | `DAILY` | Automated cluster snapshot generation cadence. |
| **Backup Target** | `LOCAL_DOWNLOAD`, `SERVER_DISK`, `S3_REMOTE` | `LOCAL_DOWNLOAD` | Storage destination for generated cluster backups. |
| **Include Memories** | `boolean` | `true` | Packages all agent vector memories into the snapshot archive. |
| **Include Artifacts** | `boolean` | `true` | Packages generated document and code artifacts into the backup payload. |
| **Encrypt Backups** | `boolean` | `false` | Encrypts backup snapshots with AES-256 before disk writing or download. |
| **Export Snapshot** | Action / Download | `N/A` | Generates and downloads an immediate `.json` snapshot of the complete cluster state. |
| **Import Snapshot** | Action / Upload | `N/A` | Uploads and validates a `.json` snapshot with an inspection preview before applying. |
| **Factory Reset** | Destructive Action | `N/A` | Wipes all local configurations, fleets, and agents back to default factory state (requires typed confirmation). |

---

## 10. Hermes Daemon REST/WebSocket API Reference

When connecting Hermes Mission Control to a live daemon, the application interacts with these core endpoints:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/health` | `GET` | Verifies daemon connectivity and retrieves Hermes version and uptime. |
| `/v1/profiles` | `GET` | Returns list of configured agent profiles on the host. |
| `/v1/fleets` | `GET` | Returns swarms and fleet partitions defined on the host. |
| `/v1/models` | `GET` | Returns models currently loaded or supported by the daemon. |
| `/v1/skills` | `GET` | Returns installed autonomous skill modules. |
| `/v1/toolsets` | `GET` | Returns active toolsets accessible to agents. |
| `/v1/chat/completions` | `POST` | Streams agent responses with `<think>` tags and tool calls. |
| `/v1/tasks` | `GET` / `POST` | Synchronizes distributed autonomous task queues. |

---

*Hermes Mission Control • Built for Distributed Autonomous Swarm Intelligence.*
