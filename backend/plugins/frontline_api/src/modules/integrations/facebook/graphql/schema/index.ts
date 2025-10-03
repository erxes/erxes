import {
  mutations as FacebookMutations,
  queries as FacebookQueries,
  types as FacebookTypes,
} from './facebook';

export const types = `
  ${FacebookTypes},

`;

export const queries = `
  ${FacebookQueries}

`;

export const mutations = `
  ${FacebookMutations}

`;
