import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes,
} from '@/settings/graphql/schemas/configs';
import {
  inputs as ContributionProfileInputs,
  mutations as ContributionProfileMutations,
  queries as ContributionProfileQueries,
  types as ContributionProfileTypes,
} from '@/settings/graphql/schemas/contributionProfiles';
import {
  inputs as GradeInputs,
  mutations as GradeMutations,
  queries as GradeQueries,
  types as GradeTypes,
} from '@/settings/graphql/schemas/grades';
import {
  inputs as SeniorityRuleInputs,
  mutations as SeniorityRuleMutations,
  queries as SeniorityRuleQueries,
  types as SeniorityRuleTypes,
} from '@/settings/graphql/schemas/seniorityRules';
import {
  inputs as SkillInputs,
  mutations as SkillMutations,
  queries as SkillQueries,
  types as SkillTypes,
} from '@/settings/graphql/schemas/skills';

export const types = `
  ${ConfigTypes}
  ${ContributionProfileTypes}
  ${ContributionProfileInputs}
  ${GradeTypes}
  ${GradeInputs}
  ${SeniorityRuleTypes}
  ${SeniorityRuleInputs}
  ${SkillTypes}
  ${SkillInputs}
`;

export const queries = `
  ${ConfigQueries}
  ${ContributionProfileQueries}
  ${GradeQueries}
  ${SeniorityRuleQueries}
  ${SkillQueries}
`;

export const mutations = `
  ${ConfigMutations}
  ${ContributionProfileMutations}
  ${GradeMutations}
  ${SeniorityRuleMutations}
  ${SkillMutations}
`;

export default { types, queries, mutations };
