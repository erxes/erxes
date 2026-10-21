export const AI_AGENT_SUPPORTED_PROVIDERS = [
  'cloudflare-ai-gateway',
  'grok',
  'kimi',
  'kimi-code',
  'openai',
] as const;

export const AI_AGENT_DEFAULT_PROVIDER = 'cloudflare-ai-gateway';

export const AI_AGENT_PROVIDER_DEFAULT_MODELS = {
  'cloudflare-ai-gateway': 'openai/gpt-5-mini',
  grok: 'grok-4.3',
  kimi: 'kimi-k2.6',
  'kimi-code': 'kimi-for-coding',
  openai: 'gpt-5-mini',
} as const;

// Curated picks shown first; anything newer still appears from the provider
// list and the model catalog.
export const AI_AGENT_RECOMMENDED_MODELS: Record<
  (typeof AI_AGENT_SUPPORTED_PROVIDERS)[number],
  string[]
> = {
  'cloudflare-ai-gateway': [
    'openai/gpt-5-mini',
    'openai/gpt-5',
    'openai/gpt-4.1-mini',
    'openai/gpt-4o-mini',
    'anthropic/claude-sonnet-5.5',
    'google-ai-studio/gemini-2.5-flash',
    'workers-ai/@cf/moonshotai/kimi-k2.6',
  ],
  grok: [
    'grok-4.3',
    'grok-4.7',
    'grok-4.6',
    'grok-4.5',
    'grok-4.20-0309-non-reasoning',
  ],
  kimi: ['kimi-k2.6', 'kimi-k3'],
  'kimi-code': ['kimi-for-coding'],
  openai: [
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4o-mini',
  ],
};

export const AI_AGENT_SUPPORTED_CONTEXT_FILE_EXTENSIONS = [
  '.md',
  '.markdown',
  '.txt',
] as const;

export const AI_AGENT_SUPPORTED_CONTEXT_FILE_TYPES = [
  'text/markdown',
  'text/plain',
  'text/x-markdown',
  'application/octet-stream',
] as const;

export const AI_AGENT_DEFAULTS = {
  baseUrl: 'https://gateway.ai.cloudflare.com/v1',
  grokBaseUrl: 'https://api.x.ai/v1',
  kimiBaseUrl: 'https://api.moonshot.ai/v1',
  kimiCodingBaseUrl: 'https://api.kimi.com/coding',
  openAiBaseUrl: 'https://api.openai.com/v1',
  cloudflareAiGatewayBaseUrl: 'https://gateway.ai.cloudflare.com/v1',
  cloudflareAiGatewayMode: 'compat',
  temperature: 0,
  maxTokens: 2000,
  timeoutMs: 15000,
} as const;

// gpt-5 models bill internal reasoning against the completion budget, so a low
// cap can return no visible text at all.
export const AI_AGENT_REASONING_MODEL_MIN_MAX_TOKENS = 2000;

// Each tool round adds its results to the prompt and its planning to the
// reasoning budget, so a tool turn needs more headroom than a plain reply —
// otherwise the final answer is cut off mid-sentence.
export const AI_AGENT_TOOL_LOOP_MIN_MAX_TOKENS = 4000;

// A support reply quotes retrieved passages; it does not need the deliberation
// budget a reasoning model spends by default, and that budget is most of the
// wall clock. Raise this if answers start missing the point.
export const AI_AGENT_REASONING_EFFORT = 'low';

export const AI_AGENT_LIMITS = {
  maxNameChars: 80,
  maxDescriptionChars: 500,
  maxSystemPromptChars: 4000,
  maxFiles: 10,
  maxModelChars: 200,
  maxSecretChars: 2000,
  maxMaxTokens: 32768,
  minTimeoutMs: 1000,
  maxTimeoutMs: 30000,
  maxSingleFileBytes: 50_000,
  maxTotalContextBytes: 200_000,
} as const;
