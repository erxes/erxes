import {
  types as BranchTypes,
  queries as BranchQueries,
  mutations as BranchMutations,
} from '@/branched/graphql/schemas/branch';

export const types = `
  ${BranchTypes}
`;

export const queries = `
  ${BranchQueries}
`;

export const mutations = `
  ${BranchMutations}
`;
