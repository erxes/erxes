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
  
  ${ImportHistoryTypes}
   ${ExportHistoryTypes}
`;

export let queries = `
  ${ImportHistoryQueries}
   ${ExportHistoryQueries}
`;

export let mutations = `

  ${ImportHistoryMutations}
  ${ExportHistoryMutations}

`;

export default { types, queries, mutations };
