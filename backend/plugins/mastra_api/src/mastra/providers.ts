import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// ---------------------------------------------------------------------------
// Kimi "thinking" compatibility shim.
//
// Kimi K2.5/K2.6 (incl. the Kimi For Coding model) are reasoning models with
// thinking enabled. Their API requires every assistant message that carries
// `tool_calls` to ALSO carry a `reasoning_content` field. During multi-step
// tool calling — and when prior turns are replayed from memory — the AI SDK
// does not send `reasoning_content` back, so the request fails with HTTP 400:
//   "thinking is enabled but reasoning_content is missing in assistant tool
//    call message at index N".
// This is a known incompatibility across many clients (Goose, Cursor, Zed,
// OpenCode…). The accepted fix is to ensure the field exists, defaulting it to
// an empty string when missing. We do that here as fetch middleware so it works
// regardless of how Mastra/the SDK build the message array internally.
// ---------------------------------------------------------------------------
function withReasoningContentShim(
  baseFetch: typeof fetch = globalThis.fetch,
): typeof fetch {
  return (async (input: any, init?: any) => {
    if (init?.body && typeof init.body === 'string') {
      try {
        const payload = JSON.parse(init.body);
        if (Array.isArray(payload?.messages)) {
          let mutated = false;
          for (const m of payload.messages) {
            if (
              m?.role === 'assistant' &&
              Array.isArray(m.tool_calls) &&
              m.tool_calls.length > 0 &&
              (m.reasoning_content === undefined || m.reasoning_content === null)
            ) {
              m.reasoning_content = '';
              mutated = true;
            }
          }
          if (mutated) init = { ...init, body: JSON.stringify(payload) };
        }
      } catch {
        // Body isn't JSON we can parse — forward untouched.
      }
    }
    return baseFetch(input, init);
  }) as typeof fetch;
}

// Kimi/Moonshot reasoning models need the shim above; other OpenAI-compatible
// providers (NVIDIA NIM, etc.) must not receive the extra field.
function needsReasoningContentShim(providerName: string, baseURL: string): boolean {
  return /kimi|moonshot/i.test(providerName) || /kimi\.com|moonshot/i.test(baseURL);
}

// ---------------------------------------------------------------------------
// PROVIDER_PRESETS — static data used ONLY by the "Add Provider" form pre-fill
// in the UI.  Runtime model building reads exclusively from DB docs.
// ---------------------------------------------------------------------------
export const PROVIDER_PRESETS: Array<{
  provider: string;
  label: string;
  envKey: string;
  baseUrl?: string;
  modelsEndpoint?: string;
  isOpenAICompatible?: boolean;
  // Custom HTTP headers sent with every request to this provider. Needed by
  // gated endpoints — e.g. "Kimi For Coding" only serves recognized coding
  // agents and rejects (HTTP 403 access_terminated_error) any request whose
  // User-Agent it doesn't recognize.
  headers?: Record<string, string>;
  models: { id: string; name: string }[];
}> = [
  {
    provider: 'openai',
    label: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    modelsEndpoint: 'https://api.openai.com/v1/models',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'o3-mini', name: 'O3 Mini' },
      { id: 'o4-mini', name: 'O4 Mini' },
      { id: 'o3', name: 'O3' },
      { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview' },
    ],
  },
  {
    provider: 'anthropic',
    label: 'Anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    models: [
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5' },
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
      { id: 'claude-opus-4', name: 'Claude Opus 4' },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4' },
    ],
  },
  {
    provider: 'google',
    label: 'Google Gemini',
    envKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ],
  },
  {
    provider: 'groq',
    label: 'Groq',
    envKey: 'GROQ_API_KEY',
    modelsEndpoint: 'https://api.groq.com/openai/v1/models',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
      { id: 'gemma2-9b-it', name: 'Gemma2 9B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Mistral',
    envKey: 'MISTRAL_API_KEY',
    modelsEndpoint: 'https://api.mistral.ai/v1/models',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
      { id: 'codestral-latest', name: 'Codestral' },
    ],
  },
  {
    provider: 'cohere',
    label: 'Cohere',
    envKey: 'CO_API_KEY',
    models: [
      { id: 'command-r-plus', name: 'Command R+' },
      { id: 'command-r', name: 'Command R' },
      { id: 'command-light', name: 'Command Light' },
    ],
  },
  {
    provider: 'kimi',
    label: 'Kimi (Moonshot)',
    envKey: 'MOONSHOT_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    isOpenAICompatible: true,
    models: [
      { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K' },
      { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K' },
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K' },
    ],
  },
  {
    provider: 'kimi-k2',
    label: 'Kimi K2 (Coding)',
    envKey: 'MOONSHOT_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    isOpenAICompatible: true,
    models: [
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2 Preview' },
    ],
  },
  {
    // "Kimi For Coding" is a DISTINCT product from the standard Moonshot Open
    // Platform (different base URL, different key prefix `sk-kimi-`, single
    // auto-updating model id). It is access-gated to recognized coding agents,
    // so a coding-agent User-Agent header is mandatory — without it the chat
    // endpoint returns HTTP 403 access_terminated_error. (The /models endpoint
    // is NOT gated.)
    provider: 'kimi-for-coding',
    label: 'Kimi For Coding',
    envKey: 'KIMI_API_KEY',
    baseUrl: 'https://api.kimi.com/coding/v1',
    isOpenAICompatible: true,
    headers: { 'User-Agent': 'claude-cli/1.0.65 (external, cli)' },
    models: [
      // Stable alias — the backend maps it to the latest coding model (K2.6).
      { id: 'kimi-for-coding', name: 'Kimi For Coding (auto-latest)' },
    ],
  },
  {
    provider: 'nvidia-nim',
    label: 'NVIDIA NIM',
    envKey: 'NVIDIA_API_KEY',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    isOpenAICompatible: true,
    // Only models that reliably support the tool_calls API field are listed here.
    // Llama 3.1 8B does NOT support tool_calls — it outputs function call intent as
    // plain text, which breaks agent tool execution.
    models: [
      { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct' },
      { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct' },
      { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B Instruct' },
      { id: 'mistralai/mixtral-8x7b-instruct-v0.1', name: 'Mixtral 8x7B Instruct' },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B Instruct' },
    ],
  },
];

// Providers whose SDK accepts a plain "<provider>/<modelId>" string rather than
// a model object.  These are the native Mastra/Vercel AI SDK providers.
export const NATIVE_MASTRA_PROVIDERS = new Set([
  'openai',
  'anthropic',
  'google',
  'groq',
  'mistral',
  'cohere',
]);

/**
 * Returns true when the provider should use `agent.generateLegacy(...)` (i.e.
 * it is OpenAI-compatible and goes through `createOpenAICompatible`).
 *
 * Uses `||` not `??` so that a Mongoose `default: false` on an existing DB doc
 * cannot mask a preset that correctly declares `isOpenAICompatible: true`.
 */
export function isLegacyProvider(providerName: string, docs: any[]): boolean {
  const preset = PROVIDER_PRESETS.find((p) => p.provider === providerName);
  const doc = docs.find((d: any) => d.provider === providerName);
  return preset?.isOpenAICompatible === true || doc?.isOpenAICompatible === true;
}

/**
 * Build a Mastra/Vercel AI SDK model instance (or string ref) from DB data.
 * DB doc fields take priority; PROVIDER_PRESETS supply the defaults for any
 * field not yet stored (e.g. providers added before the dynamic-catalog migration).
 *
 * @param providerName  The provider key stored on the agent
 * @param modelId       The model id stored on the agent
 * @param providerDocs  Enabled provider documents fetched from DB
 */
export function buildModel(providerName: string, modelId: string, providerDocs: any[]): any {
  const stored = providerDocs.find((p: any) => p.provider === providerName && p.isEnabled);
  const preset = PROVIDER_PRESETS.find((p) => p.provider === providerName);

  // Resolve API key: DB record first, then env var (DB envKey, then preset envKey)
  const envKey = stored?.envKey || preset?.envKey;
  const apiKey = stored?.apiKey || (envKey ? process.env[envKey] : undefined);

  // Preset is authoritative for isOpenAICompatible on known providers.
  // `||` (not `??`) so that a Mongoose default: false on a DB doc inserted
  // before the field existed cannot mask a preset that says true.
  const isOpenAICompatible = preset?.isOpenAICompatible === true
    || stored?.isOpenAICompatible === true;

  if (isOpenAICompatible) {
    const baseURL = stored?.baseUrl || preset?.baseUrl || '';
    // Merge preset defaults with stored overrides (stored wins). Required for
    // gated endpoints like Kimi For Coding that demand a coding-agent User-Agent.
    const mergedHeaders = { ...(preset?.headers || {}), ...(stored?.headers || {}) };
    const provider = createOpenAICompatible({
      name: providerName,
      baseURL,
      apiKey: apiKey || '',
      headers: Object.keys(mergedHeaders).length ? mergedHeaders : undefined,
      // Kimi/Moonshot reasoning models reject tool-call histories that omit
      // reasoning_content — patch it in via fetch middleware.
      ...(needsReasoningContentShim(providerName, baseURL)
        ? { fetch: withReasoningContentShim() }
        : {}),
    });
    return provider(modelId);
  }

  // Standard Mastra string-based providers — inject API key into env if needed
  if (apiKey && envKey) {
    process.env[envKey] = apiKey;
  }

  return `${providerName}/${modelId}`;
}
