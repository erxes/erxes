import { agentMutations } from '@/agent/graphql/resolvers/mutations/agent';
import { providerMutations } from '@/provider/graphql/resolvers/mutations/provider';
import { settingsMutations } from '@/settings/graphql/resolvers/mutations/settings';
import { sessionMutations } from '@/session/graphql/resolvers/mutations/session';
import { workflowMutations } from '@/workflow/graphql/resolvers/mutations/workflow';

export const mutations = {
  ...agentMutations,
  ...providerMutations,
  ...settingsMutations,
  ...sessionMutations,
  ...workflowMutations,
};
