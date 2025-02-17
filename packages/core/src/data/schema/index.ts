import {
  mutations as BrandMutations,
  queries as BrandQueries,
  types as BrandTypes,
} from './brand';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes,
} from './config';
import {
  mutations as ConformityMutations,
  types as ConformityTypes,
} from './conformity';
import {
  mutations as PermissionMutations,
  queries as PermissionQueries,
  types as PermissionTypes,
} from './permission';
import {
  mutations as RobotMutations,
  queries as RobotQueries,
  types as RobotTypes,
} from './robot';
import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes,
} from './user';
import {
  mutations as StructureMutations,
  queries as StructureQueries,
  types as StructureTypes,
} from './structure';
import {
  types as AppTypes,
  mutations as AppMutations,
  queries as AppQueries,
} from './app';

import {
  types as TagTypes,
  mutations as TagMutations,
  queries as TagQueries,
} from './tag';

import {
  types as InternalNoteTypes,
  mutations as InternalNoteMutations,
  queries as InternalNoteQueries,
} from './internalNote';

import { queries as ChargeQueries, types as ChargeTypes } from './charge';
import {
  mutations as PromoCodeMutations,
  types as PromoCodeTypes,
} from '../schema/promoCode';
import { queries as PluginQueries, types as PluginTypes } from './plugins';

import {
  queries as OnboardingQueries,
  mutations as OnboardingMutations,
} from './organizations';

import { types as LogTypes, queries as LogQueries } from './logs';

import {
  types as EmailDeliveryTypes,
  queries as EmailDeliveryQueries,
} from './emailDeliveries';

import {
  types as ActivityLogTypes,
  queries as ActivityLogQueries,
} from './activityLogs';

import {
  types as SegmentTypes,
  queries as SegmentQueries,
  mutations as SegmentMutations,
} from './segment';

import {
  fieldsTypes as FieldsTypes,
  fieldsQueries as FieldsQueries,
  fieldsMutations as FieldsMutations,
  fieldsGroupsTypes as FieldsGroupsTypes,
  fieldsGroupsQueries as FieldsGroupsQueries,
  fieldsGroupsMutations as FieldsGroupsMutations,
} from './field';

import {
  types as CompanyTypes,
  queries as CompanyQueries,
  mutations as CompanyMutations,
} from './company';
import {
  types as CustomerTypes,
  queries as CustomerQueries,
  mutations as CustomerMutations,
} from './customer';
import { types as ContactsTypes, queries as ContactsQueries } from './contacts';

import {
  types as ProductTypes,
  queries as ProductQueries,
  mutations as ProductMutations,
} from './product';

import {
  types as UomTypes,
  queries as UomQueries,
  mutations as UomMutations,
} from './uom';

import {
  types as FormTypes,
  queries as FormQueries,
  mutations as FormMutations,
} from './form';

import {
  types as EmailTemplatesTypes,
  queries as EmailTemplatesQueries,
  mutations as EmailTemplatesMutations,
} from './emailTemplate';

import {
  types as InsightTypes,
  queries as InsightQueries,
  mutations as InsightMutations,
} from './insight';

import {
  types as RateTypes,
  queries as RateQueries,
  mutations as RateMutations,
} from './exchangeRates';

export let types = ({ inboxEnabled }) => {
  return `
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

  ${
    inboxEnabled
      ? `
        extend type Integration @key(fields: "_id") {
          _id: String! @external
        }
      `
      : ''
  }  
  

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
  ${FormTypes(inboxEnabled)}
  ${FieldsTypes}
  ${FieldsGroupsTypes}
  ${ContactsTypes}
  ${CompanyTypes}
  ${CustomerTypes(inboxEnabled)}
  ${ProductTypes}
  ${UomTypes}
  ${EmailTemplatesTypes}
  ${InsightTypes}
  ${RateTypes}
  `;
};

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
  ${FormQueries}
  ${FieldsQueries}
  ${FieldsGroupsQueries}
  ${ContactsQueries}
  ${CompanyQueries}
  ${CustomerQueries}
  ${ProductQueries}
  ${UomQueries}
  ${EmailTemplatesQueries}
  ${InsightQueries}
  ${RateQueries}
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
  ${FormMutations}
  ${FieldsMutations}
  ${FieldsGroupsMutations}
  ${CompanyMutations}
  ${CustomerMutations}
  ${ProductMutations}
  ${UomMutations}
  ${EmailTemplatesMutations}
  ${InsightMutations}
  ${RateMutations}
`;

export let subscriptions = `
  onboardingChanged(userId: String!): OnboardingNotification

  userChanged(userId: String): JSON
`;

export default { types, queries, mutations, subscriptions };
