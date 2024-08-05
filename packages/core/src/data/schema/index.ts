import {
  mutations as BrandMutations,
  queries as BrandQueries,
  types as BrandTypes
} from "./brand";
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes
} from "./config";
import {
  mutations as ConformityMutations,
  types as ConformityTypes
} from "./conformity";
import {
  mutations as PermissionMutations,
  queries as PermissionQueries,
  types as PermissionTypes
} from "./permission";
import {
  mutations as RobotMutations,
  queries as RobotQueries,
  types as RobotTypes
} from "./robot";
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes
} from "./user";
import {
  mutations as StructureMutations,
  queries as StructureQueries,
  types as StructureTypes
} from "./structure";
import {
  types as AppTypes,
  mutations as AppMutations,
  queries as AppQueries
} from "./app";

import {
  types as TagTypes,
  mutations as TagMutations,
  queries as TagQueries
} from "./tag";

import {
  types as InternalNoteTypes,
  mutations as InternalNoteMutations,
  queries as InternalNoteQueries
} from "./internalNote";

import { queries as ChargeQueries, types as ChargeTypes } from "./charge";
import {
  mutations as PromoCodeMutations,
  types as PromoCodeTypes
} from "../schema/promoCode";
import { queries as PluginQueries, types as PluginTypes } from "./plugins";

import {
  queries as OnboardingQueries,
  mutations as OnboardingMutations
} from "./organizations";

import { types as LogTypes, queries as LogQueries } from "./logs";

import {
  types as EmailDeliveryTypes,
  queries as EmailDeliveryQueries
} from "./emailDeliveries";

import {
  types as ActivityLogTypes,
  queries as ActivityLogQueries
} from "./activityLogs";

import {
  types as SegmentTypes,
  queries as SegmentQueries,
  mutations as SegmentMutations
} from "./segment";

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
  
  ${UserTypes}
  ${BrandTypes}
  ${ConformityTypes}
  ${ConfigTypes}
  ${PermissionTypes}
  ${RobotTypes}
  ${StructureTypes}
  ${AppTypes}
  ${ChargeTypes}
  ${PromoCodeTypes}
  ${PluginTypes}
  ${TagTypes}
  ${InternalNoteTypes}
  ${LogTypes}
  ${EmailDeliveryTypes}
  ${ActivityLogTypes}
  ${SegmentTypes}
`;

export let queries = `
  ${UserQueries}
  ${BrandQueries}
  
  ${ConfigQueries}
  ${PermissionQueries}
  ${RobotQueries}
  ${StructureQueries}
  ${AppQueries}
  ${ChargeQueries}
  ${PluginQueries}
  ${OnboardingQueries}
  ${TagQueries}
  ${InternalNoteQueries}
  ${LogQueries}
  ${EmailDeliveryQueries}
  ${ActivityLogQueries}
  ${SegmentQueries}
`;

export let mutations = `
  ${UserMutations}
  ${BrandMutations}
  ${ConfigMutations}
  ${PermissionMutations}
  ${ConformityMutations}
  ${RobotMutations}
  ${StructureMutations}
  ${AppMutations}
  ${PromoCodeMutations}
  ${OnboardingMutations}
  ${TagMutations}
  ${InternalNoteMutations}
  ${SegmentMutations}
`;

export let subscriptions = `
  onboardingChanged(userId: String!): OnboardingNotification

  userChanged(userId: String): JSON
`;

export default { types, queries, mutations, subscriptions };
