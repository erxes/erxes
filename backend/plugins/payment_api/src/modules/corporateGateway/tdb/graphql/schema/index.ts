import {
  types as ConfigTypes,
  queries as ConfigQueries,
  mutations as ConfigMutations,
} from './configs';

import {
  types as OrderTypes,
  queries as OrderQueries,
  mutations as OrderMutations,
} from './orders';

export const types = `
  ${ConfigTypes}
  ${OrderTypes}
`;

export const queries = `
  ${ConfigQueries}
  ${OrderQueries}
`;

export const mutations = `
  ${ConfigMutations}
  ${OrderMutations}
`;

export default {
  types,
  queries,
  mutations,
};
