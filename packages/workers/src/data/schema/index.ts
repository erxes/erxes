import {
  mutations as ImportHistoryMutations,
  queries as ImportHistoryQueries,
  types as ImportHistoryTypes
} from './importHistory';

import {
  mutations as ExportHistoryMutations,
  queries as ExportHistoryQueries,
  types as ExportHistoryTypes
} from './exportHistory';

import { queries as GeneralHistoryQueries } from './generalHistory';

export let types = `
  scalar JSON
  scalar Date

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
  
  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  
  ${ImportHistoryTypes}
   ${ExportHistoryTypes}
`;

export let queries = `
  ${ImportHistoryQueries}
   ${ExportHistoryQueries}
   ${GeneralHistoryQueries}
`;

export let mutations = `

  ${ImportHistoryMutations}
  ${ExportHistoryMutations}

`;

export default { types, queries, mutations };
