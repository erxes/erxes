import { types as accountTypes, queries as accountQueries } from './accounts';
import {
  types as configTypes,
  queries as configQueries,
  mutations as configMutations,
} from './configs';
import {
  types as transferTypes,
  mutations as transferMutations,
} from './transfer';

export const types = `
  ${accountTypes}
  ${configTypes}
  ${transferTypes}
`;

export const queries = `
  ${accountQueries}
  ${configQueries}
`;

export const mutations = `
  ${configMutations}
  ${transferMutations}
`;
