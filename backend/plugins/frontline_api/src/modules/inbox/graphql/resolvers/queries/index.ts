import { channelQueries } from './channels';
import { conversationQueries } from './conversations';
import { integrationQueries } from './integrations';
export const queries = {
  ...channelQueries,
  ...conversationQueries,
  ...integrationQueries,
};
