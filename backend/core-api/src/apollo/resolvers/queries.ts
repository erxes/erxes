import { appQueries } from '@/apps/graphql/queries';
import { authQueries } from '@/auth/graphql/resolvers/queries';
import { automationQueries } from '@/automations/graphql/resolvers/queries';
import { clientPortalQueries } from '@/clientportal/graphql/resolvers/queries/clientPortal';
import { cpUserQueries } from '@/clientportal/graphql/resolvers/queries/cpUser';
import { commentQueries } from '@/clientportal/graphql/resolvers/queries/comment';
import { cpNotificationQueries } from '@/clientportal/graphql/resolvers/queries/cpNotification';
import { contactQueries } from '@/contacts/graphql/resolvers/queries';
import { documentQueries } from '@/documents/graphql/queries';
import { exchangeRateQueries } from '@/exchangeRates/graphql/resolvers';
import { queries as formQueries } from '@/forms/graphql/resolvers';
import { internalNoteQueries } from '@/internalNote/graphql/queries';
import { logQueries } from '@/logs/graphql/resolvers/queries';
import { notificationQueries } from '@/notifications/graphql/resolver/queries';
import { brandQueries } from '@/organization/brand/graphql/queries';
import { organizationConfigQueries } from '@/organization/settings/graphql/configs/queries';
import { favoriteQueries } from '@/organization/settings/graphql/favorites/queries';
import { structureQueries } from '@/organization/structure/graphql/resolvers/queries';
import { userQueries } from '@/organization/team-member/graphql/queries';
import { permissionQueries } from '@/permissions/graphql/resolvers/queries/permission';
import { roleQueries } from '@/permissions/graphql/resolvers/queries/role';
import { usersGroupQueries } from '@/permissions/graphql/resolvers/queries/userGroup';
import { productQueries } from '@/products/graphql/resolvers/queries';
import { relationsQueries } from '@/relations/graphql/queries';
import { segmentQueries } from '@/segments/graphql/resolvers';
import { tagQueries } from '@/tags/graphql/queries';
import {
  importQueries,
  exportQueries,
} from '~/modules/import-export/graphql/resolvers';
import { activityLogQueries } from '@/logs/graphql/resolvers/activityLogQueries';
import { broadcastQueries } from '~/modules/broadcast/graphql/resolvers/queries';
import { propertiesQueries } from '~/modules/properties/graphql/resolvers/queries';

export const queries = {
  ...contactQueries,
  ...authQueries,
  ...userQueries,
  ...tagQueries,
  ...productQueries,
  ...appQueries,
  ...formQueries,
  ...segmentQueries,
  ...relationsQueries,
  ...favoriteQueries,
  ...structureQueries,
  ...brandQueries,
  ...organizationConfigQueries,
  ...exchangeRateQueries,
  ...permissionQueries,
  ...usersGroupQueries,
  ...documentQueries,
  ...automationQueries,
  ...logQueries,
  ...notificationQueries,
  ...internalNoteQueries,
  ...roleQueries,
  ...broadcastQueries,
  ...propertiesQueries,
  ...clientPortalQueries,
  ...importQueries,
  ...exportQueries,
  ...cpUserQueries,
  ...commentQueries,
  ...cpNotificationQueries,
  ...activityLogQueries,
};
