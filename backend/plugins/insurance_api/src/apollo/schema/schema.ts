import {
  mutations as InsuranceMutations,
  queries as InsuranceQueries,
  types as InsuranceTypes,
} from '@/insurance/graphql/schemas/insurance';

export const types = `
  ${InsuranceTypes}
`;

export const queries = `
  ${InsuranceQueries}
`;

export const mutations = `
  ${InsuranceMutations}
`;

export default { types, queries, mutations };
