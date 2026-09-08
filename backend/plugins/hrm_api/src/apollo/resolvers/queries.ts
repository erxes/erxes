import { configQueries } from '@/settings/graphql/resolvers/queries/configs';
import { contributionProfileQueries } from '@/settings/graphql/resolvers/queries/contributionProfiles';
import { gradeQueries } from '@/settings/graphql/resolvers/queries/grades';
import { seniorityRuleQueries } from '@/settings/graphql/resolvers/queries/seniorityRules';
import { skillQueries } from '@/settings/graphql/resolvers/queries/skills';

export const queries = {
  ...configQueries,
  ...contributionProfileQueries,
  ...gradeQueries,
  ...seniorityRuleQueries,
  ...skillQueries,
};
