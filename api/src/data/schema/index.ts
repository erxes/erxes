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
  queries as EmailDeliveryQueries,
  types as EmailDelivery
} from './emailDelivery';
import {
  mutations as EmailTemplateMutations,
  queries as EmailTemplateQueries,
  types as EmailTemplate
} from './emailTemplate';
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
  mutations as InternalNoteMutations,
  queries as InternalNoteQueries,
  types as InternalNoteTypes
} from './internalNote';
import {
  mutations as PermissionMutations,
  queries as PermissionQueries,
  types as PermissionTypes
} from './permission';
import {
  mutations as ProductMutations,
  queries as ProductQueries,
  types as ProductTypes
} from './product';
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
  mutations as TagMutations,
  queries as TagQueries,
  types as TagTypes
} from './tag';
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes
} from './user';
import {
  mutations as WebhookMutations,
  queries as WebhookQueries,
  types as WebhookTypes
} from './webhook';
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
  ${InternalNoteTypes}
  ${BrandTypes}
  ${EmailTemplate}
  ${EmailDelivery}
  ${TagTypes}
  ${FieldTypes}
  ${FormTypes}
  ${ConformityTypes}
  ${SegmentTypes}
  ${ProductTypes}
  ${ConfigTypes}
  ${FieldGroupTypes}
  ${ImportHistoryTypes}
  ${PermissionTypes}
  ${RobotTypes}
  ${WebhookTypes}
  ${SmsDeliveryTypes}
  ${StructureTypes}
`;

export let queries = `
  ${UserQueries}
  ${BrandQueries}
  ${EmailTemplateQueries}
  ${EmailDeliveryQueries}
  ${FieldQueries}
  ${FormQueries}
  ${TagQueries}
  ${InternalNoteQueries}
  ${SegmentQueries}
  
  ${ProductQueries}
  ${ConfigQueries}
  ${FieldGroupQueries}
  ${ImportHistoryQueries}
  ${PermissionQueries}
  ${RobotQueries}
  ${WebhookQueries}
  ${SmsDeliveryQueries}
  ${StructureQueries}
`;

export let mutations = `
  ${UserMutations}
  ${TagMutations}
  ${BrandMutations}
  ${EmailTemplateMutations}
  ${InternalNoteMutations}
  ${SegmentMutations}
  ${FieldMutations}
  ${FormMutatons}
  ${ProductMutations}
  ${ConfigMutations}
  ${FieldGroupMutations}
  ${ImportHistoryMutations}
  ${PermissionMutations}
  ${ConformityMutations}
  ${RobotMutations}
  ${WebhookMutations}
  ${StructureMutations}
`;

export let subscriptions = `
  importHistoryChanged(_id: String!): ImportHistory
  onboardingChanged(userId: String!): OnboardingNotification

  userChanged(userId: String): JSON
`;

export default { types, queries, mutations, subscriptions };
