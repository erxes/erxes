import { modelProvider } from '../modelProvider';

export const kimi = modelProvider({
  key: 'kimi',
  name: 'Kimi Moonshot API',
  summary: 'Kimi models on the Moonshot API, for the assistant and agents.',
  dashboard: 'https://platform.kimi.ai/console/api-keys',
  baseUrl: 'https://api.moonshot.ai/v1',
});
