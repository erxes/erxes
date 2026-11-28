import { modelProvider } from '../modelProvider';

export const openrouter = modelProvider({
  key: 'openrouter',
  name: 'OpenRouter',
  summary: 'Models from many labs through one key, for the assistant and agents.',
  dashboard: 'https://openrouter.ai/settings/keys',
  baseUrl: 'https://openrouter.ai/api/v1',
  checkPath: '/key',
});
