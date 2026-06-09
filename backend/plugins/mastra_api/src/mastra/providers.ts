import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

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
    provider: 'kimi-for-coding',
    label: 'Kimi for Coding',
    envKey: 'MOONSHOT_API_KEY',
    baseUrl: 'https://api.moonshot.cn/v1',
    isOpenAICompatible: true,
    models: [
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2 Preview' },
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K' },
      { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K' },
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
    const provider = createOpenAICompatible({ name: providerName, baseURL, apiKey: apiKey || '' });
    return provider(modelId);
  }

  // Standard Mastra string-based providers — inject API key into env if needed
  if (apiKey && envKey) {
    process.env[envKey] = apiKey;
  }

  return `${providerName}/${modelId}`;
}
