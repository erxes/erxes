import {
  types as ConfigTypes,
  queries as ConfigQueries,
  mutations as ConfigMutations,
} from './configs';

import {
  types as AccountTypes,
  queries as AccountQueries,
} from './accounts';

import {
  types as TransferTypes,
  mutations as TransferMutations,
  inputs as TransferInputs,
} from './transfers';

import {
  types as OrderTypes,
  mutations as OrderMutations,
  inputTypes as OrderInputs,
} from './orders';

export const types = `
  ${ConfigTypes}
  ${AccountTypes}
  ${TransferTypes}
  ${TransferInputs}
  ${OrderTypes}
  ${OrderInputs}
`;

export const queries = `
  ${ConfigQueries}
  ${AccountQueries}
`;

export const mutations = `
  ${ConfigMutations}
  ${TransferMutations}
  ${OrderMutations}
`;

export default {
  types,
  queries,
  mutations,
};