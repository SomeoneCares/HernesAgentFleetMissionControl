// Real Hermes Agent Service for Nous Research Hermes Gateway (Default port: 8642)

export interface HermesConnectionResult {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  models: string[];
  version?: string;
  error?: string;
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
 * Tries /health, /health/detailed, and /v1/models.
 */
export async function testHermesConnection(
  serverUrl: string,
  authToken?: string
): Promise<HermesConnectionResult> {
  const base = normalizeHermesUrl(serverUrl);
  const startTime = performance.now();

  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  if (authToken && authToken.trim()) {
    headers['Authorization'] = `Bearer ${authToken.trim()}`;
  }

  // 1. Try /health first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${base}/health`, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      let version = 'Hermes Gateway';
      try {
        const data = await res.json();
        if (data.version) version = data.version;
      } catch {
        // text ok
      }

      // Also try to list models
      const models = await fetchHermesModels(base, authToken);

      return {
        ok: true,
        latencyMs: latency,
        statusCode: res.status,
        models: models.length > 0 ? models : ['hermes-agent'],
        version
      };
    }
  } catch (err: any) {
    // Continue to fallback check /v1/models
  }

  // 2. Try /v1/models (OpenAI compatibility endpoint)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${base}/v1/models`, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json();
      const models = Array.isArray(data?.data)
        ? data.data.map((m: any) => m.id || m.name || String(m))
        : ['hermes-agent'];

      return {
        ok: true,
        latencyMs: latency,
        statusCode: res.status,
        models: models.length > 0 ? models : ['hermes-agent'],
        version: 'OpenAI-Compatible Gateway'
      };
    } else {
      return {
        ok: false,
        latencyMs: Math.round(performance.now() - startTime),
        statusCode: res.status,
        models: [],
        error: `Server responded with HTTP ${res.status}: ${res.statusText}`
      };
    }
  } catch (err: any) {
    const latency = Math.round(performance.now() - startTime);
    let errMsg = err.message || 'Connection refused';
    if (err.name === 'AbortError') {
      errMsg = 'Connection timed out (no response from port 8642 within 4s)';
    } else if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
      errMsg = `Failed to connect to ${base}. Verify your Hermes agent daemon is running via "hermes gateway --port 8642". If running in a browser, ensure CORS allows requests or run the daemon with CORS enabled.`;
    }

    return {
      ok: false,
      latencyMs: latency,
      models: [],
      error: errMsg
    };
  }
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
 * Sends a real chat completion request to the Hermes Gateway /v1/chat/completions endpoint.
 */
export async function sendHermesChatCompletion(
  serverUrl: string,
  messages: HermesChatMessage[],
  model: string = 'hermes-agent',
  authToken?: string
): Promise<{ ok: boolean; replyText?: string; error?: string; modelUsed?: string; toolCalls?: any[] }> {
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
    const replyText = choice?.message?.content || choice?.text || '';
    const toolCalls = choice?.message?.tool_calls;

    return {
      ok: true,
      replyText,
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
