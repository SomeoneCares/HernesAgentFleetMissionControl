# Hermes Agent Connection & Setup Guide (Real Agent Mode)

This guide provides step-by-step instructions to connect **Hermes Mission Control** directly to your real **Hermes Agent** running on your local machine or server with **zero mockup data**.

---

## 1. Port Architecture & Overview

The official Hermes Agent stack uses dedicated ports:

| Port | Service / Purpose | Description |
| :--- | :--- | :--- |
| **`8642`** | **Hermes Agent Gateway & API** *(Default)* | OpenAI-compatible REST server (`/v1/chat/completions`, `/v1/models`, `/health`). |
| **`9119`** | **Hermes Agent Web UI** | Dedicated local web management interface. |
| **`3000`** | **Hermes Mission Control** | This mission control dashboard portal. |

---

## 2. Step-by-Step Connection Instructions

### Step 1: Install Hermes Agent CLI
Ensure you have Python 3.10+ installed, then install or upgrade `hermes-agent`:
```bash
pip install --upgrade hermes-agent
```

Verify the installation:
```bash
hermes --version
```

---

### Step 2: Configure Environment Variables
Configure the Hermes API server to listen on port **`8642`** on all interfaces (`0.0.0.0`):

#### On Linux / macOS (Bash / Zsh):
```bash
export API_SERVER_ENABLED=true
export API_SERVER_PORT=8642
export API_SERVER_HOST=0.0.0.0
```

#### Persistent Configuration:
Save these variables into your `~/.hermes/.env` configuration file so they persist across terminal reboots:
```bash
mkdir -p ~/.hermes
cat << 'EOF' >> ~/.hermes/.env
API_SERVER_ENABLED=true
API_SERVER_PORT=8642
API_SERVER_HOST=0.0.0.0
EOF
```

#### On Windows (PowerShell):
```powershell
$env:API_SERVER_ENABLED="true"
$env:API_SERVER_PORT="8642"
$env:API_SERVER_HOST="0.0.0.0"
```

---

### Step 3: Launch the Hermes Gateway Daemon
Run the Hermes gateway service:
```bash
hermes gateway --port 8642 --host 0.0.0.0
```

*Expected output in terminal:*
```text
[INFO] Hermes Gateway starting up...
[INFO] OpenAI-compatible REST server listening on http://0.0.0.0:8642
[INFO] Available endpoints:
       - GET  /health
       - GET  /v1/models
       - POST /v1/chat/completions
```

---

### Step 4: Verify the Daemon Socket with cURL
Open another terminal tab to verify that the daemon is accepting connections:

```bash
curl http://localhost:8642/health
```
*Expected response:*
```json
{"status": "ok", "version": "hermes-agent-v1"}
```

Check available models:
```bash
curl http://localhost:8642/v1/models
```

---

### Step 5: Connect in Hermes Mission Control
1. Open the **Hermes Mission Control** dashboard in your browser.
2. Click the **Settings icon (⚙️)** in the top navigation bar.
3. In the **Connection & Cluster Gateways** tab:
   - **Daemon Endpoint**: Verify the endpoint is set to `http://localhost:8642` (or `http://127.0.0.1:8642`).
   - **Auth Token (Optional)**: If you set up an API key on your gateway, paste it into the **Auth Token** field.
4. Click **"Test Connection"** to verify the socket handshake and latency.

---

### Step 6: Purge Mockup Data (Real Agent Mode)
To eliminate all simulated demonstration agents, mockup personas, and dummy tasks:

1. Inside the Settings modal under **Data Source Mode**:
2. Click **"Purge Mock Data"** (or click **"Sync Real Agent"**).
3. The dashboard will:
   - Purge all hardcoded demo agents and placeholder task items.
   - Bind the cluster state to your real **Hermes Agent**.
   - Switch the system status to:
     `● REAL AGENT ONLY (MOCK DATA PURGED)`

---

### Step 7: Interact with Real Agent in Comms & Chat
1. Navigate to the **Comms & Chat** tab.
2. The header will indicate: `Hermes Agent (Live) • LIVE GATEWAY • http://localhost:8642`.
3. Type any prompt or directive (e.g., `Hello Hermes, run diagnostics`).
4. Requests are dispatched directly to `POST http://localhost:8642/v1/chat/completions`.
5. You will receive authentic reasoning streams, tool calls, and model outputs directly from your real Hermes daemon.

---

## 3. Troubleshooting & FAQ

### Issue: "Unable to reach Hermes Agent on http://localhost:8642"
- **Cause 1**: The daemon is not running.
  - *Fix*: Start the gateway using `hermes gateway --port 8642 --host 0.0.0.0`.
- **Cause 2**: Browser Cross-Origin Resource Sharing (CORS) restriction.
  - *Fix*: When running in a web browser, ensure the gateway allows CORS. Hermes Gateway supports CORS by default when launched with `--host 0.0.0.0`. If behind a reverse proxy (Nginx or Caddy), ensure `Access-Control-Allow-Origin: *` headers are forwarded.
- **Cause 3**: Port conflict on 8642.
  - *Fix*: Check if another process is using port 8642:
    ```bash
    # Linux / macOS
    lsof -i :8642
    # Windows
    netstat -ano | findstr :8642
    ```

### How to Restore Mockup Demo Data
If you ever want to preview demo mode again:
1. Open **Settings (⚙️)**.
2. Click **"Restore Mockups"**.
3. All demo agents, tasks, and telemetry simulations will be reloaded.
