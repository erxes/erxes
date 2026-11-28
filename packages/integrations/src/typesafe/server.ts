import { modelProvider } from '../modelProvider';

export const typesafe = modelProvider({
  key: 'typesafe',
  name: 'TypeSafe',
  summary: 'Jev decision models that pick an automation’s path.',
  dashboard: 'https://console.typesafe.ai',
  baseUrl: 'https://api.typesafe.ai/v1',
  category: 'decision',
});
