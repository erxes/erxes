import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// The provider-document fields this module reads — satisfied by Mongoose
// MastraProvider docs and by plain objects in tests.
export interface ProviderDocLike {
  provider?: string;
  isEnabled?: boolean;
  isOpenAICompatible?: boolean;
  envKey?: string;
  apiKey?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
}

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
  return ((input: Parameters<typeof fetch>[0], init?: RequestInit) => {
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
              (m.reasoning_content === undefined ||
                m.reasoning_content === null)
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
function needsReasoningContentShim(
  providerName: string,
  baseURL: string,
): boolean {
  return (
    /kimi|moonshot/i.test(providerName) || /kimi\.com|moonshot/i.test(baseURL)
  );
}

// ---------------------------------------------------------------------------
// PROVIDER_PRESETS — connection data for known providers, used by the
// "Add Provider" form pre-fill and the live model-catalog resolver.
//
// There are NO static model lists here on purpose: every preset declares how
// to reach the provider's live model-listing API (`modelsEndpoint`, or the
// `{baseUrl}/models` convention for OpenAI-compatible providers) and the UI
// fetches what is actually available at that moment via mastraProviderModels.
// Runtime model building reads exclusively from DB docs.
// ---------------------------------------------------------------------------
export const PROVIDER_PRESETS: Array<{
  provider: string;
  label: string;
  envKey: string;
  baseUrl?: string;
  modelsEndpoint?: string;
  // How the model-listing endpoint authenticates. Default: 'bearer'
  // (Authorization: Bearer <key>). 'x-api-key' sends the key in that header
  // (Anthropic); 'query' appends ?key=<key> (Google Generative Language).
  modelsAuth?: 'bearer' | 'x-api-key' | 'query';
  isOpenAICompatible?: boolean;
  // Custom HTTP headers sent with every request to this provider. Needed by
  // gated endpoints — e.g. "Kimi For Coding" only serves recognized coding
  // agents and rejects (HTTP 403 access_terminated_error) any request whose
  // User-Agent it doesn't recognize.
  headers?: Record<string, string>;
}> = [
  {
    provider: 'openai',
    label: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    modelsEndpoint: 'https://api.openai.com/v1/models',
  },
  {
    provider: 'anthropic',
    label: 'Anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    modelsEndpoint: 'https://api.anthropic.com/v1/models',
    modelsAuth: 'x-api-key',
    // Anthropic requires a version header on every API call. The chat path
    // doesn't use these headers (native SDK provider) — only model listing.
    headers: { 'anthropic-version': '2023-06-01' },
  },
  {
    provider: 'google',
    label: 'Google Gemini',
    envKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
    modelsEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    modelsAuth: 'query',
  },
  {
    provider: 'groq',
    label: 'Groq',
    envKey: 'GROQ_API_KEY',
    modelsEndpoint: 'https://api.groq.com/openai/v1/models',
  },
  {
    provider: 'mistral',
    label: 'Mistral',
    envKey: 'MISTRAL_API_KEY',
    modelsEndpoint: 'https://api.mistral.ai/v1/models',
  },
  {
    provider: 'cohere',
    label: 'Cohere',
    envKey: 'CO_API_KEY',
    modelsEndpoint: 'https://api.cohere.com/v1/models',
  },
  {
    provider: 'kimi',
    label: 'Kimi (Moonshot)',
    envKey: 'MOONSHOT_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    isOpenAICompatible: true,
  },
  {
    provider: 'kimi-k2',
    label: 'Kimi K2 (Coding)',
    envKey: 'MOONSHOT_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    isOpenAICompatible: true,
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
  },
  {
    provider: 'nvidia-nim',
    label: 'NVIDIA NIM',
    envKey: 'NVIDIA_API_KEY',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    isOpenAICompatible: true,
  },
];

// Providers whose SDK accepts a plain "<provider>/<modelId>" string rather than
// a model object.  These are the native Mastra/Vercel AI SDK providers.
export const NATIVE_ERXES_AGENT_PROVIDERS = new Set([
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
export function isLegacyProvider(
  providerName: string,
  docs: ProviderDocLike[],
): boolean {
  const preset = PROVIDER_PRESETS.find((p) => p.provider === providerName);
  const doc = docs.find((d) => d.provider === providerName);
  return (
    preset?.isOpenAICompatible === true || doc?.isOpenAICompatible === true
  );
}

// What buildModel hands to Agent: a string ref ("openai/gpt-4o") for native
// providers, or an instantiated OpenAI-compatible model.
export type BuiltModel =
  | string
  | ReturnType<ReturnType<typeof createOpenAICompatible>>;

/**
 * Build a Mastra/Vercel AI SDK model instance (or string ref) from DB data.
 * DB doc fields take priority; PROVIDER_PRESETS supply the defaults for any
 * field not yet stored (e.g. providers added before the dynamic-catalog migration).
 *
 * @param providerName  The provider key stored on the agent
 * @param modelId       The model id stored on the agent
 * @param providerDocs  Enabled provider documents fetched from DB
 */
export function buildModel(
  providerName: string,
  modelId: string,
  providerDocs: ProviderDocLike[],
): BuiltModel {
  const stored = providerDocs.find(
    (p) => p.provider === providerName && p.isEnabled,
  );
  const preset = PROVIDER_PRESETS.find((p) => p.provider === providerName);

  // Resolve API key: DB record first, then env var (DB envKey, then preset envKey)
  const envKey = stored?.envKey || preset?.envKey;
  const apiKey = stored?.apiKey || (envKey ? process.env[envKey] : undefined);

  // Preset is authoritative for isOpenAICompatible on known providers.
  // `||` (not `??`) so that a Mongoose default: false on a DB doc inserted
  // before the field existed cannot mask a preset that says true.
  const isOpenAICompatible =
    preset?.isOpenAICompatible === true || stored?.isOpenAICompatible === true;

  if (isOpenAICompatible) {
    const baseURL = stored?.baseUrl || preset?.baseUrl || '';
    // Merge preset defaults with stored overrides (stored wins). Required for
    // gated endpoints like Kimi For Coding that demand a coding-agent User-Agent.
    const mergedHeaders = {
      ...(preset?.headers || {}),
      ...(stored?.headers || {}),
    };
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
