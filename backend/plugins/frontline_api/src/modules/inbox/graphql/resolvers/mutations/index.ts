import { channelMutations } from './channels';
import { conversationMutations } from './conversations';
import { integrationMutations } from './integrations';
export const mutations = {
  ...channelMutations,
  ...conversationMutations,
  ...integrationMutations,
};
