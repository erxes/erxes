import { agentMutations } from '@/agent/graphql/resolvers/mutations/agent';
import { toolMutations } from '@/tool/graphql/resolvers/mutations/tool';
import { providerMutations } from '@/provider/graphql/resolvers/mutations/provider';
import { settingsMutations } from '@/settings/graphql/resolvers/mutations/settings';

export const mutations = {
  ...agentMutations,
  ...toolMutations,
  ...providerMutations,
  ...settingsMutations,
};
