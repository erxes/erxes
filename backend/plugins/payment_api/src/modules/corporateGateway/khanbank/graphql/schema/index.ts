import { types as accountTypes, queries as accountQueries } from './accounts';
import {
  types as configTypes,
  queries as configQueries,
  mutations as configMutations,
} from './configs';
import {
  types as taxTypes,
  queries as taxQueries,
  mutations as taxMutations,
} from './taxes';
import {
  types as transferTypes,
  mutations as transferMutations,
} from './transfer';

export const types = `
  ${accountTypes}
  ${configTypes}
  ${taxTypes}
  ${transferTypes}
`;

export const queries = `
  ${accountQueries}
  ${configQueries}
  ${taxQueries}
`;

export const mutations = `
  ${configMutations}
  ${taxMutations}
  ${transferMutations}
`;
