import {
  mutations as PricingMutations,
  queries as PricingQueries,
  types as PricingTypes,
} from '@/pricing/graphql/schemas/pricing';

export const types = `
  ${PricingTypes}
`;

export const queries = `
  ${PricingQueries}
`;

export const mutations = `
  ${PricingMutations}
`;

export default { types, queries, mutations };
