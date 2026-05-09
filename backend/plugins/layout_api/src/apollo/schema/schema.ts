import {
  mutations as LayoutsMutations,
  queries as LayoutsQueries,
  types as LayoutsTypes,
} from '@/layouts/graphql/schemas/layouts';

export const types = `
  ${LayoutsTypes}
`;

export const queries = `
  ${LayoutsQueries}
`;

export const mutations = `
  ${LayoutsMutations}
`;

export default { types, queries, mutations };
