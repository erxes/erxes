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

import {
  mutations as systemFieldMutations,
  queries as systemFieldQueries,
  types as systemFieldTypes,
} from './systemField';

export const types = `
    ${fieldTypes}
    ${groupTypes}
    ${propertyTypes}
    ${systemFieldTypes}
`;

export const queries = `
    ${fieldQueries}
    ${groupQueries}
    ${propertyQueries}
    ${systemFieldQueries}
`;

export const mutations = `
    ${fieldMutations}
    ${groupMutations}
    ${systemFieldMutations}
`;
