// Real Hermes Agent Service for Nous Research Hermes Gateway (Default port: 8642)

export interface HermesConnectionResult {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  models: string[];
  skills?: string[];
  toolsets?: string[];
  version?: string;
  error?: string;
  isMixedContent?: boolean;
}

export interface HermesChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Normalizes a base URL to ensure clean endpoint requests without trailing slashes.
 */
export function normalizeHermesUrl(rawUrl: string): string {
  let url = (rawUrl || 'http://localhost:8642').trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  return url.replace(/\/+$/, '');
}

/**
 * Tests live connection handshake with Hermes Agent API Gateway (port 8642).
 * Tries /health, /v1/models, /v1/skills, and /v1/toolsets.
 */
export async function testHermesConnection(
  serverUrl: string,
  authToken?: string
): Promise<HermesConnectionResult> {
  const base = normalizeHermesUrl(serverUrl);
  const startTime = performance.now();
  const isHttpsOrigin = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isHttpTarget = base.startsWith('http://');

  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  let version = 'Hermes Gateway';
  let isConnected = false;
  let statusCode = 200;

  // 1. Try /health first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${base}/health`, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      isConnected = true;
      statusCode = res.status;
      try {
        const data = await res.json();
        if (data.version) version = data.version;
      } catch {
        // text ok
      }
    }
  } catch (err: any) {
    // Continue to fallback check /v1/models
  }

  // 2. Try /v1/models (OpenAI compatibility endpoint)
  let models: string[] = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${base}/v1/models`, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      isConnected = true;
      statusCode = res.status;
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        models = data.data.map((m: any) => m.id || m.name || String(m));
      }
    }
  } catch (err: any) {
    // Handled in final check
  }

  // 3. Try to discover skills and toolsets if connected
  let skills: string[] = [];
  let toolsets: string[] = [];
  if (isConnected) {
    try {
      skills = await fetchHermesSkills(base, authToken);
    } catch {}
    try {
      toolsets = await fetchHermesToolsets(base, authToken);
    } catch {}
  }

  const latency = Math.round(performance.now() - startTime);

  if (isConnected) {
    return {
      ok: true,
      latencyMs: latency,
      statusCode,
      models: models.length > 0 ? models : ['hermes-agent'],
      skills: skills.length > 0 ? skills : undefined,
      toolsets: toolsets.length > 0 ? toolsets : undefined,
      version: version || 'OpenAI-Compatible Gateway'
    };
  }

  // If failed, formulate helpful error diagnosis
  let errMsg = 'Connection refused or host unreachable';
  let isMixed = false;

  if (isHttpsOrigin && isHttpTarget) {
    isMixed = true;
    errMsg = `Browser Mixed Content Block: This cloud preview runs on HTTPS, which strictly blocks direct HTTP requests to ${base}. Run "npx localtunnel --port 8642" in your terminal and enter the https:// URL in Settings, or run this app locally via "npm run dev".`;
  } else {
    errMsg = `Failed to connect to ${base}. Verify your Hermes daemon is active with "hermes gateway --port 8642 --host 0.0.0.0" and CORS origins are enabled.`;
  }

  return {
    ok: false,
    latencyMs: latency,
    statusCode: 0,
    models: [],
    error: errMsg,
    isMixedContent: isMixed
  };
}

/**
 * Fetches available models from the Hermes Agent /v1/models endpoint.
 */
export async function fetchHermesModels(serverUrl: string, authToken?: string): Promise<string[]> {
  const base = normalizeHermesUrl(serverUrl);
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${base}/v1/models`, { headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        return json.data.map((m: any) => m.id || m.name || String(m));
      }
    }
  } catch {
    // fallback
  }
  return [];
}

/**
 * Discovers skills from the Hermes Agent /v1/skills endpoint if supported.
 */
export async function fetchHermesSkills(serverUrl: string, authToken?: string): Promise<string[]> {
  const base = normalizeHermesUrl(serverUrl);
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${base}/v1/skills`, { headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.skills)) return data.skills.map((s: any) => s.name || s.id || String(s));
      if (Array.isArray(data?.data)) return data.data.map((s: any) => s.name || s.id || String(s));
      if (Array.isArray(data)) return data.map((s: any) => s.name || s.id || String(s));
    }
  } catch {}
  return [];
}

/**
 * Discovers toolsets from the Hermes Agent /v1/toolsets endpoint if supported.
 */
export async function fetchHermesToolsets(serverUrl: string, authToken?: string): Promise<string[]> {
  const base = normalizeHermesUrl(serverUrl);
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${base}/v1/toolsets`, { headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.toolsets)) return data.toolsets.map((t: any) => t.name || t.id || String(t));
      if (Array.isArray(data?.data)) return data.data.map((t: any) => t.name || t.id || String(t));
      if (Array.isArray(data)) return data.map((t: any) => t.name || t.id || String(t));
    }
  } catch {}
  return [];
}

/**
 * Sends a real chat completion request to the Hermes Gateway /v1/chat/completions endpoint.
 */
export async function sendHermesChatCompletion(
  serverUrl: string,
  messages: HermesChatMessage[],
  model: string = 'hermes-agent',
  authToken?: string
): Promise<{ ok: boolean; replyText?: string; thought?: string; error?: string; modelUsed?: string; toolCalls?: any[] }> {
  const base = normalizeHermesUrl(serverUrl);
  const endpoint = `${base}/v1/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  const payload = {
    model: model || 'hermes-agent',
    messages,
    temperature: 0.7,
    stream: false
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return {
        ok: false,
        error: `Hermes Agent error (HTTP ${res.status}): ${errBody || res.statusText}`
      };
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    let rawContent = choice?.message?.content || choice?.text || '';
    let thought = choice?.message?.reasoning_content || choice?.message?.thought || choice?.message?.reasoning || '';
    const toolCalls = choice?.message?.tool_calls;

    // Parse <think>...</think>, <thought>...</thought>, <reasoning>...</reasoning> tags
    if (!thought && typeof rawContent === 'string') {
      const thinkMatch = rawContent.match(/<(?:think|thought|reasoning)>([\s\S]*?)(?:<\/(?:think|thought|reasoning)>|$)/i);
      if (thinkMatch) {
        thought = thinkMatch[1].trim();
        rawContent = rawContent.replace(/<(?:think|thought|reasoning)>[\s\S]*?(?:<\/(?:think|thought|reasoning)>|$)/i, '').trim();
      }
    }

    return {
      ok: true,
      replyText: rawContent,
      thought: thought ? String(thought).trim() : undefined,
      modelUsed: data.model || model,
      toolCalls
    };
  } catch (err: any) {
    return {
      ok: false,
      error: `Network error reaching Hermes Gateway at ${endpoint}: ${err.message || 'Connection failed'}. Check if 'hermes gateway' is running.`
    };
  }
}

export interface DiscoveredHermesProfile {
  name: string;
  codename?: string;
  description?: string;
  model?: string;
  skills?: string[];
  tools?: string[];
  soulPrompt?: string;
  fleetId?: string;
  status?: string;
  role?: string;
}

export interface DiscoveredHermesFleet {
  id: string;
  name: string;
  codename: string;
  description?: string;
  purpose?: string;
  model?: string;
  profiles?: DiscoveredHermesProfile[];
}

export async function fetchHermesProfilesAndFleets(
  serverUrl: string,
  authToken?: string
): Promise<{
  ok: boolean;
  profiles: DiscoveredHermesProfile[];
  fleets: DiscoveredHermesFleet[];
  rawResponse?: any;
  error?: string;
}> {
  const base = serverUrl.replace(/\/+$/, '');
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  const profiles: DiscoveredHermesProfile[] = [];
  const fleets: DiscoveredHermesFleet[] = [];

  const probeJson = async (path: string): Promise<any> => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${base}${path}`, {
        headers,
        signal: controller.signal
      });
      clearTimeout(id);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Check possible profile endpoints
  const profilePaths = [
    '/v1/profiles',
    '/profiles',
    '/api/profiles',
    '/v1/agents',
    '/agents'
  ];

  for (const path of profilePaths) {
    const data = await probeJson(path);
    if (data) {
      const list = Array.isArray(data) ? data : data.profiles || data.agents || data.data;
      if (Array.isArray(list)) {
        list.forEach((item: any) => {
          if (typeof item === 'string') {
            profiles.push({
              name: item,
              codename: `HERMES-${item.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
              role: `Autonomous agent running profile ${item}`
            });
          } else if (item && typeof item === 'object') {
            profiles.push({
              name: item.name || item.id || item.profile || 'Unnamed Profile',
              codename: item.codename || (item.name ? `HERMES-${String(item.name).toUpperCase().replace(/[^A-Z0-9]/g, '-')}` : undefined),
              description: item.description || item.bio || item.prompt,
              model: item.model || item.modelId || item.model_id,
              skills: Array.isArray(item.skills) ? item.skills : undefined,
              tools: Array.isArray(item.tools) ? item.tools : undefined,
              soulPrompt: item.soul || item.soulPrompt || item.system_prompt || item.prompt,
              role: item.role || item.description
            });
          }
        });
        if (profiles.length > 0) break;
      }
    }
  }

  // Check possible fleet endpoints
  const fleetPaths = [
    '/v1/fleets',
    '/fleets',
    '/api/fleets'
  ];

  for (const path of fleetPaths) {
    const data = await probeJson(path);
    if (data) {
      const list = Array.isArray(data) ? data : data.fleets || data.data;
      if (Array.isArray(list)) {
        list.forEach((item: any) => {
          if (typeof item === 'string') {
            fleets.push({
              id: `fleet-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: item,
              codename: `FLEET-${item.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
              description: `Partitioned fleet discovered from Hermes daemon: ${item}`
            });
          } else if (item && typeof item === 'object') {
            fleets.push({
              id: item.id || `fleet-${(item.name || 'unnamed').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: item.name || item.id || 'Discovered Fleet',
              codename: item.codename || `FLEET-${(item.name || 'HERMES').toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
              description: item.description || 'Hermes multi-agent fleet',
              purpose: item.purpose || 'Custom Swarm',
              model: item.model || item.defaultModelId
            });
          }
        });
        if (fleets.length > 0) break;
      }
    }
  }

  // Also check /config or /status
  if (profiles.length === 0 && fleets.length === 0) {
    const configData = await probeJson('/config') || await probeJson('/status');
    if (configData) {
      if (configData.profiles && typeof configData.profiles === 'object') {
        const pList = Array.isArray(configData.profiles) ? configData.profiles : Object.keys(configData.profiles).map(k => ({ name: k, ...configData.profiles[k] }));
        pList.forEach((p: any) => {
          profiles.push({
            name: p.name || 'Profile',
            codename: `HERMES-${(p.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
            model: p.model,
            soulPrompt: p.soul || p.system_prompt
          });
        });
      }
      if (configData.fleets && typeof configData.fleets === 'object') {
        const fList = Array.isArray(configData.fleets) ? configData.fleets : Object.keys(configData.fleets).map(k => ({ name: k, ...configData.fleets[k] }));
        fList.forEach((f: any) => {
          fleets.push({
            id: f.id || `fleet-${(f.name || 'unnamed').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: f.name || 'Fleet',
            codename: f.codename || `FLEET-${(f.name || 'HERMES').toUpperCase().replace(/[^A-Z0-9]/g, '-')}`
          });
        });
      }
    }
  }

  return {
    ok: profiles.length > 0 || fleets.length > 0,
    profiles,
    fleets
  };
}

