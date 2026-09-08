import { configMutations } from '@/settings/graphql/resolvers/mutations/configs';
import { contributionProfileMutations } from '@/settings/graphql/resolvers/mutations/contributionProfiles';
import { gradeMutations } from '@/settings/graphql/resolvers/mutations/grades';
import { seniorityRuleMutations } from '@/settings/graphql/resolvers/mutations/seniorityRules';
import { skillMutations } from '@/settings/graphql/resolvers/mutations/skills';

export const mutations = {
  ...configMutations,
  ...contributionProfileMutations,
  ...gradeMutations,
  ...seniorityRuleMutations,
  ...skillMutations,
};
