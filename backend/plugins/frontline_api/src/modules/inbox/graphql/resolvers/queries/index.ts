import { conversationQueries } from './conversations';
import { integrationQueries } from './integrations';
export const queries = {
  ...conversationQueries,
  ...integrationQueries,
};
