import { conversationMutations } from './conversations';
import { integrationMutations } from './integrations';
export const mutations = {
  ...conversationMutations,
  ...integrationMutations,
};
