import {
  mutations as InsuranceMutations,
  queries as InsuranceQueries,
  types as InsuranceTypes,
  inputs as InsuranceInputs
} from '@/insurance/graphql/schemas/insurance';

export const types = `
  ${InsuranceTypes}

  ${InsuranceInputs}
`;

export const queries = `
  ${InsuranceQueries}
`;

export const mutations = `
  ${InsuranceMutations}
`;

export default { types, queries, mutations };
