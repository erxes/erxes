import { modelProvider } from '../modelProvider';

export const openai = modelProvider({
  key: 'openai',
  name: 'OpenAI',
  summary: 'GPT models for the assistant and agents.',
  dashboard: 'https://platform.openai.com/api-keys',
  baseUrl: 'https://api.openai.com/v1',
});
