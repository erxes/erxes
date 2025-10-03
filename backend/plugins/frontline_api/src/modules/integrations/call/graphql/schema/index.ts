import {
  mutations as CallMutations,
  queries as CallQueries,
  types as CallTypes,
  subscriptions as CallSubscriptions,
} from './call';

export const types = `
    ${CallTypes},
  `;

export const queries = `
    ${CallQueries}
  `;

export const mutations = `
    ${CallMutations}
  `;

export const subscriptions = `
    ${CallSubscriptions}
  `;
