import type { AssistantProvider } from '@erxes/core-contract';

export const PROVIDER_LABELS: Record<AssistantProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  openrouter: 'OpenRouter',
  kimi: 'Kimi Moonshot API',
  'kimi-code': 'Kimi For Coding',
  grok: 'Grok',
};
