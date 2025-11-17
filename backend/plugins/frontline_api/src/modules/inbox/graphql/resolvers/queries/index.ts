import { conversationQueries } from './conversations';
import { integrationQueries } from './integrations';
import { widgetQueries } from './widget';
export const queries = {
  ...conversationQueries,
  ...integrationQueries,
  ...widgetQueries,
};
