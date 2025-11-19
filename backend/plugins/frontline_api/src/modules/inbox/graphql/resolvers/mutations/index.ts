import { conversationMutations } from './conversations';
import { integrationMutations } from './integrations';
import { widgetMutations } from './widget';
export const mutations = {
  ...conversationMutations,
  ...integrationMutations,
  ...widgetMutations,
};
