import { agentMutations } from '@/agent/graphql/resolvers/mutations/agent';
import { providerMutations } from '@/provider/graphql/resolvers/mutations/provider';
import { settingsMutations } from '@/settings/graphql/resolvers/mutations/settings';
import { sessionMutations } from '@/session/graphql/resolvers/mutations/session';
import { workflowMutations } from '@/workflow/graphql/resolvers/mutations/workflow';
import { learningMutations } from '@/learning/graphql/resolvers/mutations/learning';
import { scheduleMutations } from '@/schedule/graphql/resolvers/mutations/schedule';
import { skillMutations } from '@/skill/graphql/resolvers/mutations/skill';

export const mutations = {
  ...agentMutations,
  ...providerMutations,
  ...settingsMutations,
  ...sessionMutations,
  ...workflowMutations,
  ...learningMutations,
  ...scheduleMutations,
  ...skillMutations,
};
