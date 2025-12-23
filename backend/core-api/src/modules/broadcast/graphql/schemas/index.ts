import {
  mutations as EngageMutations,
  queries as EngageQueries,
  types as EngageTypes,
} from '@/broadcast/graphql/schemas/engage';

export const types = `
    ${EngageTypes}
`;

export const queries = `
    ${EngageQueries}
`;

export const mutations = `
    ${EngageMutations}
`;
