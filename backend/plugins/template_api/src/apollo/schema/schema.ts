import {
  mutations as TemplateMutations,
  queries as TemplateQueries,
  types as TemplateTypes,
  inputs as TemplateInputs,
} from '@/template/graphql/schemas/template';

export const types = `
  ${TemplateTypes}
  ${TemplateInputs}
`;

export const queries = `
  ${TemplateQueries}
`;

export const mutations = `
  ${TemplateMutations}
`;

export default { types, queries, mutations };
