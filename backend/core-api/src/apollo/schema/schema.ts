import {
  mutations as CustomerMutations,
  queries as CustomerQueries,
  types as CustomerTypes,
} from '@/contacts/graphql/schemas/customer';

import {
  mutations as CompanyMutations,
  queries as CompanyQueries,
  types as CompanyTypes,
} from '@/contacts/graphql/schemas/company';

import {
  mutations as AuthMutations,
  queries as AuthQueries,
} from '@/auth/graphql/schemas/auth';

import {
  mutations as BrandMutations,
  queries as BrandQueries,
  types as BrandTypes,
} from '@/organization/brand/graphql/schema';

import {
  mutations as branchsMutations,
  queries as branchsQueries,
  BranchTypes,
} from '@/organization/structure/graphql/schemas/branch';

import {
  mutations as departmentsMutations,
  queries as departmentsQueries,
  DepartmentTypes,
} from '@/organization/structure/graphql/schemas/department';

import {
  mutations as structuresMutations,
  queries as structuresQueries,
  StructureTypes,
} from '@/organization/structure/graphql/schemas/structure';

import {
  mutations as unitsMutations,
  queries as unitsQueries,
  UnitTypes,
} from '@/organization/structure/graphql/schemas/units';

import {
  mutations as ConfigsMutations,
  queries as ConfigsQueries,
  ConfigTypes,
} from '~/modules/organization/settings/graphql/configs/schemas';

import {
  mutations as FavoritesMutations,
  queries as FavoritesQueries,
  types as FavoritesTypes,
} from '~/modules/organization/settings/graphql/favorites/schemas';

import {
  mutations as AppMutations,
  queries as AppQueries,
  types as AppTypes,
} from '@/apps/graphql/schemas';

import {
  mutations as positionsMutations,
  queries as positionsQueries,
  PositionTypes,
} from '@/organization/structure/graphql/schemas/position';

import {
  mutations as UserMutations,
  queries as UserQueries,
  types as UserTypes,
} from '@/organization/team-member/graphql/schema';

import {
  mutations as ProductMutations,
  queries as ProductQueries,
  types as ProductTypes,
} from '@/products/graphql/schemas';

import {
  mutations as ExchangeRateMutations,
  queries as ExchangeRateQueries,
  types as ExchangeRateTypes,
} from '~/modules/exchangeRates/graphql/schemas';

import {
  mutations as SegmentMutations,
  queries as SegmentQueries,
  types as SegmentTypes,
} from '~/modules/segments/graphql/schemas';

import { queries as FormQueries } from '~/modules/forms/graphql/schema';

import {
  mutations as RelationMutations,
  queries as RelationQueries,
  types as RelationTypes,
} from '@/relations/graphql/schema';

import {
  mutations as TagMutations,
  queries as TagQueries,
  types as TagTypes,
} from '@/tags/graphql/schemas';

import {
  mutations as ConformityMutations,
  types as ConformityTypes,
} from '@/conformities/graphql/schema';

import {
  mutations as PermissionMutations,
  queries as PermissionQueries,
  types as PermissionTypes,
} from '@/permissions/graphql/schemas/permission';

import {
  mutations as UsersGroupMutations,
  queries as UsersGroupQueries,
  types as UsersGroupTypes,
} from '@/permissions/graphql/schemas/userGroup';

import {
  mutations as DocumentMutations,
  queries as DocumentQueries,
  types as DocumentTypes,
} from '@/documents/graphql/schema';

import {
  mutations as AutomationsMutations,
  queries as AutomationsQueries,
  types as AutomationsTypes,
} from '@/automations/graphql/schema';

import {
  queries as LogsQueries,
  types as LogsTypes,
} from '@/logs/graphql/schema';

import {
  mutations as InternalNoteMutations,
  queries as InternalNoteQueries,
  types as InternalNoteTypes,
} from '@/internalNote/graphql/schemas';
import {
  mutations as NotificationsMutations,
  queries as NotificationsQueries,
  types as NotificationsTypes,
} from '@/notifications/graphql/schema';
import {
  mutations as RoleMutations,
  queries as RoleQueries,
  types as RoleTypes,
} from '@/permissions/graphql/schemas/role';

import {
  mutations as PropertiesMutations,
  queries as PropertiesQueries,
  types as PropertiesTypes,
} from '@/properties/graphql/schemas';

import {
  mutations as ClientPortalMutations,
  queries as ClientPortalQueries,
  types as ClientPortalTypes,
} from '@/clientportal/graphql/schemas/clientPortal';

import {
  mutations as ImportMutations,
  queries as ImportQueries,
  types as ImportTypes,
} from '~/modules/import-export/graphql/schema/import';
import {
  mutations as ExportMutations,
  queries as ExportQueries,
  types as ExportTypes,
} from '~/modules/import-export/graphql/schema/export';
import {
  mutations as CPUserMutations,
  queries as CPUserQueries,
  types as CPUserTypes,
} from '@/clientportal/graphql/schemas/cpUser';

import {
  mutations as CommentMutations,
  queries as CommentQueries,
  types as CommentTypes,
} from '@/clientportal/graphql/schemas/comment';

import {
  mutations as CPNotificationMutations,
  queries as CPNotificationQueries,
  types as CPNotificationTypes,
} from '@/clientportal/graphql/schemas/cpNotification';

import {
  mutations as BroadcastMutations,
  queries as BroadcastQueries,
  types as BroadcastTypes,
} from '@/broadcast/graphql/schemas';

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
    ${CustomerTypes}
    ${CompanyTypes}
    ${UserTypes}
    ${ConfigTypes}
    ${TagTypes}
    ${ProductTypes}
    ${BranchTypes}
    ${DepartmentTypes}
    ${PositionTypes}
    ${StructureTypes}
    ${UnitTypes}
    ${BrandTypes}
    ${AppTypes}
    ${SegmentTypes}
    ${ConformityTypes}
    ${RelationTypes}
    ${FavoritesTypes}
    ${ExchangeRateTypes}
    ${PermissionTypes}
    ${UsersGroupTypes}
    ${DocumentTypes}
    ${AutomationsTypes}
    ${LogsTypes}
    ${NotificationsTypes}
    ${InternalNoteTypes}
    ${RoleTypes}
    ${PropertiesTypes}
    ${ClientPortalTypes}
    ${ImportTypes}
    ${ExportTypes}
    ${CPUserTypes}
    ${CommentTypes}
    ${CPNotificationTypes}
    ${BroadcastTypes}
  `;

export const queries = `
    ${CustomerQueries}
    ${CompanyQueries}
    ${AuthQueries}
    ${UserQueries}
    ${ConfigsQueries}
    ${TagQueries}
    ${ProductQueries}
    ${branchsQueries}
    ${departmentsQueries}
    ${positionsQueries}
    ${structuresQueries}
    ${unitsQueries}
    ${BrandQueries}
    ${AppQueries}
    ${FormQueries}
    ${SegmentQueries}
    ${RelationQueries}
    ${FavoritesQueries}
    ${ExchangeRateQueries}
    ${PermissionQueries}
    ${UsersGroupQueries}
    ${DocumentQueries}
    ${AutomationsQueries}
    ${LogsQueries}
    ${NotificationsQueries}
    ${InternalNoteQueries}
    ${RoleQueries}
    ${PropertiesQueries}
    ${ClientPortalQueries}
    ${ImportQueries}
    ${ExportQueries}
    ${CPUserQueries}
    ${CommentQueries}
    ${CPNotificationQueries}
    ${BroadcastQueries}
  `;

export const mutations = `
    ${CustomerMutations}
    ${CompanyMutations}
    ${AuthMutations}
    ${UserMutations}
    ${ConfigsMutations}
    ${TagMutations}
    ${ProductMutations}
    ${branchsMutations}
    ${departmentsMutations}
    ${positionsMutations}
    ${structuresMutations}
    ${unitsMutations}
    ${BrandMutations}
    ${AppMutations}
    ${SegmentMutations}
    ${ConformityMutations}
    ${RelationMutations}
    ${FavoritesMutations}
    ${ExchangeRateMutations}
    ${PermissionMutations}
    ${UsersGroupMutations}
    ${DocumentMutations}
    ${AutomationsMutations}
    ${NotificationsMutations}
    ${InternalNoteMutations}
    ${RoleMutations}
    ${PropertiesMutations}
    ${ClientPortalMutations}
    ${ImportMutations}
    ${ExportMutations}
    ${CPUserMutations}
    ${CommentMutations}
    ${CPNotificationMutations}
    ${BroadcastMutations}
  `;

export default { types, queries, mutations };
