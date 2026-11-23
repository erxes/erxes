import { modelProvider } from '../modelProvider';

export const kimiCode = modelProvider({
  key: 'kimi-code',
  name: 'Kimi For Coding',
  summary: 'The Kimi For Coding plan, for the assistant and agents.',
  dashboard: 'https://www.kimi.com/code/console',
  baseUrl: 'https://api.kimi.com/coding/v1',
});
