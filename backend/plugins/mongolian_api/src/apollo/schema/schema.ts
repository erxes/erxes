import {
  mutations as EbarimtMutations,
  queries as EbarimtQueries,
  types as EbarimtTypes,
} from '@/ebarimt/graphql/schemas';

export const types = `
  ${EbarimtTypes}
`;

export const queries = `
  ${EbarimtQueries}
`;

export const mutations = `
  ${EbarimtMutations}
`;

export default { types, queries, mutations };
