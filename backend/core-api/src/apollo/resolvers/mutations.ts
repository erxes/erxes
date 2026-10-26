import { Resolver } from 'erxes-api-shared/core-types';
import { appMutations } from '@/apps/graphql/mutations';
import { authMutations } from '@/auth/graphql/resolvers/mutations';
import { oauthClientAppMutations } from '@/auth/graphql/resolvers/oauthClientApps';
import { automationMutations } from '@/automations/graphql/resolvers/mutations';
import { emailTemplateMutations } from '@/emailTemplates/graphql/resolvers';
import { notificationTemplateMutations } from '@/notificationTemplates/graphql/resolvers';
import { connectionMutations } from '@/connections/graphql/resolvers';
import conformityMutations from '@/conformities/graphql/mutations';
import { contactMutations } from '@/contacts/graphql/resolvers/mutations';
import { documentMutations } from '@/documents/graphql/mutations';
import { internalNoteMutations } from '@/internalNote/graphql/mutations';
import { brandMutations } from '@/organization/brand/graphql/mutations';
import { organizationConfigMutations } from '@/organization/settings/graphql/configs/mutations';
import { favoriteMutations } from '@/organization/settings/graphql/favorites/mutations';
import { structureMutations } from '@/organization/structure/graphql/resolvers/mutations';
import { userMutations } from '@/organization/team-member/graphql/mutations';
import { permissionMutations } from '~/modules/permissions/graphql/resolvers/mutations/permission';
import { approvalMutations } from '@/approval/graphql/resolvers/mutations';
import { filesMutations } from '@/files/graphql/resolvers/mutations';
import { productMutations } from '@/products/graphql/resolvers/mutations';
import { relationsMutations } from '@/relations/graphql/mutations';
import { segmentMutations } from '@/segments/graphql/resolvers/mutations';
import { tagMutations } from '@/tags/graphql/mutations';
import { broadcastMutations } from '~/modules/broadcast/graphql/resolvers/mutations';
import { notificationMutations } from '~/modules/notifications/graphql/resolver/mutations';
import { propertiesMutations } from '~/modules/properties/graphql/resolvers/mutations';
import { clientPortalMutations } from '@/clientportal/graphql/resolvers/mutations/clientPortal';
import {
  importMutations,
  exportMutations,
} from '~/modules/import-export/graphql/resolvers';
import { cpUserMutations } from '@/clientportal/graphql/resolvers/mutations/cpUser';
import { commentMutations } from '@/clientportal/graphql/resolvers/mutations/comment';
import { cpNotificationMutations } from '@/clientportal/graphql/resolvers/mutations/cpNotification';
import { bundleMutations } from '@/bundle/graphql/resolvers/mutations';
import { templateMutations } from '@/template/graphql/mutations';
import { agentsConnectionMutations } from '@/agents/graphql/resolvers/mutations/connection';
import { agentsThreadMutations } from '@/agents/graphql/resolvers/mutations/threads';
import { agentsSettingsMutations } from '@/agents/graphql/resolvers/mutations/settings';

export const mutations = {
  ...contactMutations,
  ...authMutations,
  ...oauthClientAppMutations,
  ...userMutations,
  ...organizationConfigMutations,
  ...tagMutations,
  ...productMutations,
  ...appMutations,
  ...segmentMutations,
  ...conformityMutations,
  ...relationsMutations,
  ...favoriteMutations,
  ...structureMutations,
  ...brandMutations,
  ...permissionMutations,
  ...approvalMutations,
  ...filesMutations,
  ...documentMutations,
  ...automationMutations,
  ...emailTemplateMutations,
  ...notificationTemplateMutations,
  ...connectionMutations,
  ...notificationMutations,
  ...internalNoteMutations,
  ...broadcastMutations,
  ...propertiesMutations,
  ...clientPortalMutations,
  ...importMutations,
  ...exportMutations,
  ...cpUserMutations,
  ...commentMutations,
  ...cpNotificationMutations,
  ...bundleMutations,
  ...templateMutations,
  ...agentsConnectionMutations,
  ...agentsThreadMutations,
  ...agentsSettingsMutations,
};

// What the mutation log must not store (`wrapperConfig`): `sensitiveArgs` for
// arguments carrying a password, API key or credential, `sensitiveResult` for
// results carrying one (the whole result, or the listed fields). Public
// mutations (login, password reset, client portal users) are never logged.
const USER_SECRET_FIELDS = [
  'password',
  'resetPasswordToken',
  'registrationToken',
  'deviceTokens',
];
const CP_USER_SECRET_FIELDS = [
  'password',
  'code',
  'actionCode',
  'refreshTokens',
  'fcmTokens',
];
const OAUTH_CLIENT_SECRET_FIELDS = ['generatedSecret', 'secretHash'];

const SENSITIVE_MUTATIONS: [string, NonNullable<Resolver['wrapperConfig']>][] =
  [
    ['agentsConnectionUpsert', { sensitiveArgs: true }],
    ['configsUpdate', { sensitiveArgs: true }],
    ['broadcastUpdateConfigs', { sensitiveArgs: true }],
    ['usersInvite', { sensitiveArgs: true }],
    [
      'usersChangePassword',
      { sensitiveArgs: true, sensitiveResult: USER_SECRET_FIELDS },
    ],
    [
      'usersResetMemberPassword',
      { sensitiveArgs: true, sensitiveResult: USER_SECRET_FIELDS },
    ],
    ['usersEdit', { sensitiveArgs: true, sensitiveResult: USER_SECRET_FIELDS }],
    ['usersEditProfile', { sensitiveResult: USER_SECRET_FIELDS }],
    ['usersSetActiveStatus', { sensitiveResult: USER_SECRET_FIELDS }],
    ['usersSetChatStatus', { sensitiveResult: USER_SECRET_FIELDS }],
    ['usersConfigEmailSignatures', { sensitiveResult: USER_SECRET_FIELDS }],
    [
      'usersConfigGetNotificationByEmail',
      { sensitiveResult: USER_SECRET_FIELDS },
    ],
    ['userAddCustomPermission', { sensitiveResult: USER_SECRET_FIELDS }],
    ['userRemoveCustomPermission', { sensitiveResult: USER_SECRET_FIELDS }],
    ['userUpdatePermissionGroups', { sensitiveResult: USER_SECRET_FIELDS }],
    // The invitation token signs the invitee in.
    ['usersResendInvitation', { sensitiveResult: true }],
    [
      'cpUsersAdd',
      { sensitiveArgs: true, sensitiveResult: CP_USER_SECRET_FIELDS },
    ],
    [
      'cpUsersSetPassword',
      { sensitiveArgs: true, sensitiveResult: CP_USER_SECRET_FIELDS },
    ],
    ['cpUsersEdit', { sensitiveResult: CP_USER_SECRET_FIELDS }],
    // A client portal keeps its token and provider credentials.
    ['clientPortalAdd', { sensitiveResult: true }],
    ['clientPortalUpdate', { sensitiveArgs: true, sensitiveResult: true }],
    ['clientPortalChangeToken', { sensitiveResult: true }],
    ['appsAdd', { sensitiveResult: ['token'] }],
    ['appsEdit', { sensitiveResult: ['token'] }],
    ['appsRevoke', { sensitiveResult: ['token'] }],
    ['oauthClientAppsAdd', { sensitiveResult: OAUTH_CLIENT_SECRET_FIELDS }],
    ['oauthClientAppsEdit', { sensitiveResult: OAUTH_CLIENT_SECRET_FIELDS }],
    ['oauthClientAppsRevoke', { sensitiveResult: OAUTH_CLIENT_SECRET_FIELDS }],
    // A share token is a public link to the file.
    ['filesShareCreate', { sensitiveResult: ['token'] }],
  ];

const registeredMutations: Record<string, Resolver> = mutations;

for (const [name, redaction] of SENSITIVE_MUTATIONS) {
  const resolver = registeredMutations[name];

  if (!resolver) {
    throw new Error(`Unknown mutation "${name}" in SENSITIVE_MUTATIONS`);
  }

  resolver.wrapperConfig = { ...resolver.wrapperConfig, ...redaction };
}
