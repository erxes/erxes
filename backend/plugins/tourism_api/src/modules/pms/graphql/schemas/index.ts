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
  mutations as branchMutations,
  queries as branchQueries,
  types as branchTypes,
} from './pmsbranch';

export const types = `
    ${cleaningTypes}
    ${configTypes}
    ${branchTypes}
`;

export const queries = `
    ${cleaningQueries}
    ${configQueries}
    ${branchQueries}
`;

export const mutations = `
    ${cleaningMutations}
    ${configMutations}
    ${branchMutations}
`;
