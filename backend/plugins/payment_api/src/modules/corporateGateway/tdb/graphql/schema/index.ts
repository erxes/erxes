import {
  types as ConfigTypes,
  queries as ConfigQueries,
  mutations as ConfigMutations,
} from './configs';

import { types as AccountTypes, queries as AccountQueries } from './accounts';

import {
  types as TransferTypes,
  mutations as TransferMutations,
  inputs as TransferInputs,
} from './transfers';


export const types = `
  ${ConfigTypes}
  ${AccountTypes}
  ${TransferTypes}
  ${TransferInputs}
`;

export const queries = `
  ${ConfigQueries}
  ${AccountQueries}
`;

export const mutations = `
  ${ConfigMutations}
  ${TransferMutations}
`;

export default {
  types,
  queries,
  mutations,
};
