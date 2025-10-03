import {
  types as posTypes,
  queries as posQueries,
  mutations as posMutations
} from '@/pos/graphql/schemas/pos';
import {
  types as posOrderTypes,
  queries as posOrderQueries,
  mutations as posOrderMutations
} from "@/pos/graphql/schemas/orders";
import {
  types as posCoverTypes,
  queries as posCoverQueries,
  mutations as posCoverMutations
} from "@/pos/graphql/schemas/covers";
import extendTypes from '@/pos/graphql/schemas/extendTypes';

export const types = `
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type SomeType {
    visibility: CacheControlScope
  }

  ${extendTypes}
  ${posTypes()},
  ${posOrderTypes()},
  ${posCoverTypes},
`;

export const queries = `
  ${posQueries}
  ${posOrderQueries}
  ${posCoverQueries}
`;

export const mutations = `
  ${posMutations}
  ${posOrderMutations}
  ${posCoverMutations}
`;

export default { types, queries, mutations };
