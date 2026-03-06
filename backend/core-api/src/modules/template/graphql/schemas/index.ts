import {
  mutations as TemplateMutations,
  queries as TemplateQueries,
  types as TemplateTypes,
} from './template';

import {
  mutations as CategoryMutations,
  queries as CategoryQueries,
  types as CategoryTypes,
} from './category';

export const types = `
  ${TemplateTypes}
  ${CategoryTypes}
`;

export const queries = `
  ${TemplateQueries}
  ${CategoryQueries}
`;

export const mutations = `
  ${TemplateMutations}
  ${CategoryMutations}
`;
