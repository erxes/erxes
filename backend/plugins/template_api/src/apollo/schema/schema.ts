import {
  mutations as TemplateMutations,
  queries as TemplateQueries,
  types as TemplateTypes,
} from '@/template/graphql/schemas/template';

export const types = `
  ${TemplateTypes}
`;

export const queries = `
  ${TemplateQueries}
`;

export const mutations = `
  ${TemplateMutations}
`;

export default { types, queries, mutations };
