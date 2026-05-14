export const AI_AGENT_PROVIDER_TYPES = [
  'cloudflare-ai-gateway',
  'grok',
  'kimi',
  'kimi-code',
  'openai',
] as const;

export type TAiAgentProvider = (typeof AI_AGENT_PROVIDER_TYPES)[number];

export const AI_AGENT_PROVIDER_LABELS: Record<TAiAgentProvider, string> = {
  'cloudflare-ai-gateway': 'Cloudflare AI Gateway',
  grok: 'Grok',
  kimi: 'Kimi',
  'kimi-code': 'Kimi Coding',
  openai: 'OpenAI Direct',
};

export const AI_AGENT_PROVIDER_DESCRIPTIONS: Record<TAiAgentProvider, string> =
  {
    'cloudflare-ai-gateway':
      'Use the platform gateway by default, or override it with your own Cloudflare Gateway settings.',
    grok: 'Connect directly to xAI Grok with organization-owned credentials.',
    kimi: 'Connect directly to Moonshot Kimi with organization-owned credentials.',
    'kimi-code':
      'Connect to Kimi Coding with Anthropic Messages-compatible credentials.',
    openai: 'Connect directly to OpenAI with organization-owned credentials.',
  };

export const AI_AGENT_PROVIDER_DEFAULT_MODELS: Record<
  TAiAgentProvider,
  string
> = {
  'cloudflare-ai-gateway': 'openai/gpt-5-mini',
  grok: 'grok-4.3',
  kimi: 'kimi-k2.5',
  'kimi-code': 'kimi-for-coding',
  openai: 'gpt-5-mini',
};

export const AI_AGENT_PROVIDER_MODEL_OPTIONS: Record<
  TAiAgentProvider,
  string[]
> = {
  'cloudflare-ai-gateway': [
    'openai/gpt-5-mini',
    'openai/gpt-5',
    'openai/gpt-4.1-mini',
    'openai/gpt-4o-mini',
    'anthropic/claude-sonnet-4-5',
    'google-ai-studio/gemini-2.5-flash',
    'workers-ai/@cf/moonshotai/kimi-k2.5',
    'workers-ai/@cf/moonshotai/kimi-k2.6',
  ],
  grok: [
    'grok-4.3',
    'grok-4.1',
    'grok-4',
    'grok-3',
    'grok-3-mini',
    'grok-code-fast-1',
  ],
  kimi: [
    'kimi-k2.5',
    'kimi-k2-turbo-preview',
    'kimi-k2-thinking',
    'kimi-k2-thinking-turbo',
    'kimi-k2-0905-preview',
  ],
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

export const AI_AGENT_PROVIDER_DEFAULT_BASE_URLS: Record<
  TAiAgentProvider,
  string
> = {
  'cloudflare-ai-gateway': '',
  grok: 'https://api.x.ai/v1',
  kimi: 'https://api.moonshot.ai/v1',
  'kimi-code': 'https://api.kimi.com/coding',
  openai: 'https://api.openai.com/v1',
};

export const AI_AGENT_PROVIDER_API_KEY_PLACEHOLDERS: Record<
  TAiAgentProvider,
  string
> = {
  'cloudflare-ai-gateway': 'Use platform provider key',
  grok: 'Enter xAI API key',
  kimi: 'Enter Moonshot API key',
  'kimi-code': 'Enter Kimi Coding API key',
  openai: 'Enter OpenAI API key',
};
