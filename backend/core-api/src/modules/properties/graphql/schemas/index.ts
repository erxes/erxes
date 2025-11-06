import {
  mutations as fieldMutations,
  queries as fieldQueries,
  types as fieldTypes,
} from './field';
import {
  mutations as groupMutations,
  queries as groupQueries,
  types as groupTypes,
} from './group';

export const types = `
    ${fieldTypes}
    ${groupTypes}
`;

export const queries = `
    ${fieldQueries}
    ${groupQueries}
`;

export const mutations = `
    ${fieldMutations}
    ${groupMutations}
`;
