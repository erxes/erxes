export const AI_AGENT_PROVIDER_TYPES = [
  'cloudflare-ai-gateway',
  'grok',
  'kimi',
  'kimi-code',
  'openai',
] as const;

export type TAiAgentProvider = (typeof AI_AGENT_PROVIDER_TYPES)[number];

export const AI_AGENT_PROVIDERS_REQUIRING_API_KEY: TAiAgentProvider[] = [
  'grok',
  'kimi',
  'kimi-code',
  'openai',
];

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
  kimi: 'kimi-k2.6',
  'kimi-code': 'kimi-for-coding',
  openai: 'gpt-5-mini',
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
