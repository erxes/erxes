import {
  mutations as AppMutations,
  queries as AppQueries,
  types as AppTypes,
} from './schemas';

export const types = `
  ${AppTypes}
`;
export const queries = `
  ${AppQueries}
`;

export const mutations = `
  ${AppMutations}
`;
