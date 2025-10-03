import {
  mutations as ImapMutations,
  queries as ImapQueries,
  types as ImapTypes,
} from './imap';

export const types = `
  ${ImapTypes},

`;

export const queries = `
  ${ImapQueries}

`;

export const mutations = `
  ${ImapMutations}

`;
