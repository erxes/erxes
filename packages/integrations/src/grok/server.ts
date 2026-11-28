import { modelProvider } from '../modelProvider';

export const grok = modelProvider({
  key: 'grok',
  name: 'Grok',
  summary: 'xAI Grok models for the assistant and agents.',
  dashboard: 'https://console.x.ai',
  baseUrl: 'https://api.x.ai/v1',
});
