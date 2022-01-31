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
  fieldsGroupsMutations as FieldGroupMutations,
  fieldsGroupsQueries as FieldGroupQueries,
  fieldsGroupsTypes as FieldGroupTypes,
  fieldsMutations as FieldMutations,
  fieldsQueries as FieldQueries,
  fieldsTypes as FieldTypes
} from './field';
import {
  mutations as FormMutatons,
  queries as FormQueries,
  types as FormTypes
} from './form';
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
  mutations as SegmentMutations,
  queries as SegmentQueries,
  types as SegmentTypes
} from './segment';
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes
} from './user';
import {
  queries as SmsDeliveryQueries,
  types as SmsDeliveryTypes
} from './smsDelivery';
import {
  mutations as StructureMutations,
  queries as StructureQueries,
  types as StructureTypes
} from './structure';

export let types = `
  scalar JSON
  scalar Date
  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

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
  ${FieldTypes}
  ${FormTypes}
  ${ConformityTypes}
  ${SegmentTypes}
  ${ConfigTypes}
  ${FieldGroupTypes}
  ${ImportHistoryTypes}
  ${PermissionTypes}
  ${RobotTypes}
  ${SmsDeliveryTypes}
  ${StructureTypes}
`;

export let queries = `
  ${UserQueries}
  ${BrandQueries}
  ${FieldQueries}
  ${FormQueries}
  ${SegmentQueries}
  
  ${ConfigQueries}
  ${FieldGroupQueries}
  ${ImportHistoryQueries}
  ${PermissionQueries}
  ${RobotQueries}
  ${SmsDeliveryQueries}
  ${StructureQueries}
`;

export let mutations = `
  ${UserMutations}
  ${BrandMutations}
  ${SegmentMutations}
  ${FieldMutations}
  ${FormMutatons}
  ${ConfigMutations}
  ${FieldGroupMutations}
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
