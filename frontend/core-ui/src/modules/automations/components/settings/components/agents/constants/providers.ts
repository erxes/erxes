export const AI_AGENT_PROVIDER_TYPES = [
  'cloudflare-ai-gateway',
  'openai',
] as const;

export type TAiAgentProvider = (typeof AI_AGENT_PROVIDER_TYPES)[number];

export const AI_AGENT_PROVIDER_LABELS: Record<TAiAgentProvider, string> = {
  'cloudflare-ai-gateway': 'Cloudflare AI Gateway',
  openai: 'OpenAI Direct',
};

export const AI_AGENT_PROVIDER_DESCRIPTIONS: Record<TAiAgentProvider, string> =
  {
    'cloudflare-ai-gateway':
      'Use the platform gateway by default, or override it with your own Cloudflare Gateway settings.',
    openai: 'Connect directly to OpenAI with organization-owned credentials.',
  };

export const AI_AGENT_PROVIDER_DEFAULT_MODELS: Record<
  TAiAgentProvider,
  string
> = {
  'cloudflare-ai-gateway': 'openai/gpt-5-mini',
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
  openai: 'https://api.openai.com/v1',
};
