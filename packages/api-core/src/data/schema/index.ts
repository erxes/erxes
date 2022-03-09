import {
  mutations as BrandMutations,
  queries as BrandQueries,
  types as BrandTypes
} from './brand';
import { types as CommonTypes } from './common';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes
} from './config';
import {
  mutations as ConformityMutations,
  types as ConformityTypes
} from './conformity';
import {
  mutations as ImportHistoryMutations,
  queries as ImportHistoryQueries,
  types as ImportHistoryTypes
} from './importHistory';
import {
  mutations as PermissionMutations,
  queries as PermissionQueries,
  types as PermissionTypes
} from './permission';
import {
  mutations as RobotMutations,
  queries as RobotQueries,
  types as RobotTypes
} from './robot';
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes
} from './user';
import {
  mutations as StructureMutations,
  queries as StructureQueries,
  types as StructureTypes
} from './structure';

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
  
  ${CommonTypes}
  ${UserTypes}
  ${BrandTypes}
  ${ConformityTypes}
  ${ConfigTypes}
  ${ImportHistoryTypes}
  ${PermissionTypes}
  ${RobotTypes}
  ${StructureTypes}
`;

export let queries = `
  ${UserQueries}
  ${BrandQueries}
  
  ${ConfigQueries}
  ${ImportHistoryQueries}
  ${PermissionQueries}
  ${RobotQueries}
  ${StructureQueries}
`;

export let mutations = `
  ${UserMutations}
  ${BrandMutations}
  ${ConfigMutations}
  ${ImportHistoryMutations}
  ${PermissionMutations}
  ${ConformityMutations}
  ${RobotMutations}
  ${StructureMutations}
`;

export let subscriptions = `
  importHistoryChanged(_id: String!): ImportHistory
  onboardingChanged(userId: String!): OnboardingNotification

  userChanged(userId: String): JSON
`;

export default { types, queries, mutations, subscriptions };