import {
  mutations as InstagramMutations,
  queries as InstagramQueries,
  types as InstagramTypes,
} from './instagram';

export const types = `
    ${InstagramTypes},

  `;

export const queries = `
    ${InstagramQueries}

  `;

export const mutations = `
    ${InstagramMutations}

  `;
