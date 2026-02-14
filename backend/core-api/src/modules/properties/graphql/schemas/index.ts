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

import {
  queries as propertyQueries,
  types as propertyTypes,
} from './property';

export const types = `
    ${fieldTypes}
    ${groupTypes}
    ${propertyTypes}
`;

export const queries = `
    ${fieldQueries}
    ${groupQueries}
    ${propertyQueries}
`;

export const mutations = `
    ${fieldMutations}
    ${groupMutations}
`;
