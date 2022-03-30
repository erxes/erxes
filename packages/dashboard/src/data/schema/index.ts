import {
  mutations as DashboardMutations,
  queries as DashboardQueries,
  types as DashboardTypes
} from './dashboards';
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
  
  ${DashboardTypes}
`;

export let queries = `
  ${DashboardQueries}
`;

export let mutations = `

  ${DashboardMutations}

`;

export default { types, queries, mutations };
