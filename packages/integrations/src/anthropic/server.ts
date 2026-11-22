import { modelProvider } from '../modelProvider';

export const anthropic = modelProvider({
  key: 'anthropic',
  name: 'Anthropic',
  summary: 'Claude models for the assistant and agents.',
  dashboard: 'https://platform.claude.com/settings/keys',
  baseUrl: 'https://api.anthropic.com',
  modelsPath: '/v1/models',
  headers: (apiKey) => ({ 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }),
});
