import {
  mutations as cleaningMutations,
  queries as cleaningQueries,
  types as cleaningTypes,
} from './cleaning';
import {
  mutations as configMutations,
  queries as configQueries,
  types as configTypes,
} from './configs';

import {
  queries as cpBranchQueries,
  types as cpBranchTypes,
} from './cpPmsbranch';

import {
  mutations as branchMutations,
  queries as branchQueries,
  types as branchTypes,
} from './pmsbranch';

export const types = `
    ${cleaningTypes}
    ${configTypes}
    ${branchTypes}
    ${cpBranchTypes}
`;

export const queries = `
    ${cleaningQueries}
    ${configQueries}
    ${branchQueries}
    ${cpBranchQueries}
`;

export const mutations = `
    ${cleaningMutations}
    ${configMutations}
    ${branchMutations}
`;
