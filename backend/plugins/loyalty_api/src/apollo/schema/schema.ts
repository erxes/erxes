import {
  mutations as LoyaltyMutations,
  queries as LoyaltyQueries,
  types as LoyaltyTypes,
} from '@/loyalty/graphql/schemas/loyalty';

export const types = `
  ${LoyaltyTypes}
`;

export const queries = `
  ${LoyaltyQueries}
`;

export const mutations = `
  ${LoyaltyMutations}
`;

export default { types, queries, mutations };
