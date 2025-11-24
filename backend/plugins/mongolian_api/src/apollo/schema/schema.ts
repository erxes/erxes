import {
  mutations as EbarimtMutations,
  queries as EbarimtQueries,
  types as EbarimtTypes,
} from '@/ebarimt/graphql/schemas';

import {
  mutations as ErkhetMutations,
  queries as ErkhetQueries,
  types as ErkhetTypes,
} from '@/erkhet/graphql/schemas';

export const types = `
  ${EbarimtTypes}
  ${ErkhetTypes}
`;

export const queries = `
  ${EbarimtQueries}
  ${ErkhetQueries}
`;

export const mutations = `
  ${EbarimtMutations}
  ${ErkhetMutations}
`;

export default { types, queries, mutations };
