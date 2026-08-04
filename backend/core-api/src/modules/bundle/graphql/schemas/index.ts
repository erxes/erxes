import {
  mutations as bundleConditionMutations,
  queries as bundleConditionQueries,
  types as bundleConditionTypes,
} from './bundleCondition';

import {
  mutations as bundleRuleMutations,
  queries as bundleRuleQueries,
  types as bundleRuleTypes,
} from './bundleRule';

export const types = `
  ${bundleConditionTypes}
  ${bundleRuleTypes}
`;

export const queries = `
  ${bundleConditionQueries}
  ${bundleRuleQueries}
`;

export const mutations = `
  ${bundleConditionMutations}
  ${bundleRuleMutations}
`;
