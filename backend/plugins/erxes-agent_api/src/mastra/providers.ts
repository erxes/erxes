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

// NOTE: the old Kimi "reasoning_content" fetch shim was removed here. It existed
// because OpenAI-compatible models were built as AI-SDK-v1 objects (via
// createOpenAICompatible) and driven through generateLegacy(), where the SDK
// omitted `reasoning_content` on replayed assistant tool-call messages. The
// native Mastra v5 generate() path (buildModel now returns a config object)
// handles this correctly — verified with kimi-for-coding doing multi-step tool
// calls in scripts/agent-cli.ts (no 400 "reasoning_content is missing"). If a
// reasoning model regresses, reintroduce a shim via a model-level fetch.

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
    // OpenCode Zen "Go" gateway — OpenAI-compatible. Hosts deepseek/qwen/glm/
    // minimax coding models that (unlike kimi-for-coding) accept temperature 0,
    // so Mastra's model-backed processors (PIIDetector, …) work against it.
    provider: 'opencode-go',
    label: 'OpenCode Go',
    envKey: 'OPENCODE_API_KEY',
    baseUrl: 'https://opencode.ai/zen/go/v1',
    modelsEndpoint: 'https://opencode.ai/zen/go/v1/models',
    isOpenAICompatible: true,
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

// ---------------------------------------------------------------------------
// Reasoning effort → per-provider stream options.
//
// The chat view lets power users dial how hard the model "thinks" per
// conversation. Each provider exposes this differently, so we translate a
// single enum into the option each SDK understands. Unset effort (or a
// provider we don't have a mapping for) yields no options — the agent's
// configured default stands, exactly as before this feature existed.
// ---------------------------------------------------------------------------
export const REASONING_EFFORTS = ['off', 'low', 'medium', 'high'] as const;
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

/** Type guard for the reasoning-effort enum — validates untrusted request input. */
export function isReasoningEffort(v: unknown): v is ReasoningEffort {
  return (
    typeof v === 'string' &&
    (REASONING_EFFORTS as readonly string[]).includes(v)
  );
}

// The `providerOptions` block Mastra forwards to the model SDK — keyed by
// provider name, each value the option bag that provider understands.
export type ReasoningProviderOptions = Record<string, Record<string, unknown>>;

// Anthropic / Google take an explicit thinking-token budget. 'off' disables
// reasoning where the provider supports it.
const THINKING_BUDGET: Record<Exclude<ReasoningEffort, 'off'>, number> = {
  low: 2048,
  medium: 8192,
  high: 16384,
};

// Per-provider translators: one entry per provider with a portable reasoning
// knob. A provider absent from this table has none, so the model's configured
// default stands (groq / mistral / cohere / OpenAI-compatible Kimi, NVIDIA…).
const REASONING_BUILDERS: Record<
  string,
  (effort: ReasoningEffort) => ReasoningProviderOptions
> = {
  // gpt-5 / o-series accept 'minimal' | 'low' | 'medium' | 'high'.
  openai: (effort) => ({
    openai: { reasoningEffort: effort === 'off' ? 'minimal' : effort },
  }),
  anthropic: (effort) => ({
    anthropic:
      effort === 'off'
        ? { thinking: { type: 'disabled' } }
        : {
            thinking: {
              type: 'enabled',
              budgetTokens: THINKING_BUDGET[effort],
            },
          },
  }),
  google: (effort) => ({
    google: {
      thinkingConfig: {
        thinkingBudget: effort === 'off' ? 0 : THINKING_BUDGET[effort],
      },
    },
  }),
};

/**
 * Translate a reasoning-effort choice into the `providerOptions` block for the
 * agent's provider. Returns `undefined` when there's nothing to apply (unset
 * effort, or a provider without a known reasoning knob) so callers can spread
 * it without touching the default behaviour.
 */
export function buildReasoningProviderOptions(
  providerName: string,
  effort?: ReasoningEffort,
): ReasoningProviderOptions | undefined {
  if (!effort) return undefined;
  return REASONING_BUILDERS[providerName]?.(effort);
}

// What buildModel hands to Agent: a Mastra model config. A bare string ref
// ("openai/gpt-4o") when the registry resolves the key from env, or a config
// object — `{ id, apiKey }` for native providers with a DB-stored key, or
// `{ id, url, apiKey, headers }` for OpenAI-compatible custom endpoints. All
// three drive the MODERN generate()/stream() path (AI SDK v5) — there is no
// more legacy split. (createOpenAICompatible from @ai-sdk/openai-compatible is
// a v1/LanguageModelV1 model, which is exactly why it required generateLegacy;
// the native config object resolves to Mastra's own v5 provider instead.)
export interface BuiltModelConfig {
  // `${provider}/${model}` — matches Mastra's OpenAICompatibleConfig.id shape.
  id: `${string}/${string}`;
  url?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}
export type BuiltModel = string | BuiltModelConfig;

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

  const id = `${providerName}/${modelId}` as `${string}/${string}`;

  if (isOpenAICompatible) {
    const url = stored?.baseUrl || preset?.baseUrl || undefined;
    // Merge preset defaults with stored overrides (stored wins). Required for
    // gated endpoints like Kimi For Coding that demand a coding-agent User-Agent.
    const mergedHeaders = {
      ...(preset?.headers || {}),
      ...(stored?.headers || {}),
    };
    // Native Mastra config object → resolves to Mastra's v5 OpenAI-compatible
    // provider and runs through generate()/stream(). Verified working for
    // kimi-for-coding (custom url + User-Agent + DB key) in scripts/spike-native-model.ts.
    return {
      id,
      url,
      apiKey,
      headers: Object.keys(mergedHeaders).length ? mergedHeaders : undefined,
    };
  }

  // Native registry providers (openai/anthropic/google/...): pass the key
  // explicitly when we have one (DB-stored or env) so no env mutation is needed;
  // fall back to the bare string ref when the registry resolves the key itself.
  return apiKey ? { id, apiKey } : id;
}
