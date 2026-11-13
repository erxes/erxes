import { IContext } from '~/connectionResolvers';
import { ILdapConfigDocument } from '@/auth/db/definitions/ldap';
import { LdapConfigInput } from '@/auth/db/models/Ldap';
import { testLdapConnection } from '@/auth/ldap/client';
import { armLdapRecheck, getNextLdapRecheckAt } from '@/auth/ldap/worker';
import { validatePermissionGroupIds } from '@/organization/team-member/graphql/mutations';

const LDAP_PERMISSION = 'permissionsManage';

// bindPassword is write-only: the API only says whether one is stored
const toLdapConfigResponse = async (
  config: ILdapConfigDocument | null,
  subdomain: string,
) =>
  config && {
    enabled: config.enabled,
    serverType: config.serverType,
    url: config.url,
    startTls: config.startTls,
    bindDn: config.bindDn,
    hasBindPassword: Boolean(config.bindPassword),
    baseDn: config.baseDn,
    loginAttribute: config.loginAttribute,
    userFilter: config.userFilter,
    allowedGroupDns: config.allowedGroupDns || [],
    linkEmailDomains: config.linkEmailDomains || [],
    groupMappings: config.groupMappings || [],
    recheckEveryMinutes: config.recheckEveryMinutes ?? 15,
    groupChangePolicy: config.groupChangePolicy || 'updatePermissions',
    lastRecheck: config.lastRecheck,
    nextRecheckAt: config.enabled
      ? await getNextLdapRecheckAt(subdomain)
      : null,
    recheckChanges: config.recheckChanges || [],
    updatedAt: config.updatedAt,
  };

export const ldapQueries = {
  async authLdapConfig(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    return toLdapConfigResponse(
      await models.LdapConfigs.getLdapConfig(),
      subdomain,
    );
  },

  async authLdapLinkedUserIds(
    _parent: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    return models.AuthIdentities.find({ provider: 'ldap' }).distinct('userId');
  },
};

export const ldapMutations = {
  async authLdapConfigSave(
    _parent: undefined,
    { input }: { input: LdapConfigInput },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    const permissionGroupIds = [
      ...new Set(
        (input.groupMappings || []).flatMap(
          (mapping) => mapping.permissionGroupIds,
        ),
      ),
    ];

    if (permissionGroupIds.length) {
      await validatePermissionGroupIds(models, permissionGroupIds);
    }

    const config = await models.LdapConfigs.saveLdapConfig(input);

    await armLdapRecheck(models, subdomain);

    return toLdapConfigResponse(config, subdomain);
  },

  // Runs inline so the page shows the result at once
  async authLdapRecheckNow(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    await models.AuthIdentities.recheckLdapUsers();

    return toLdapConfigResponse(
      await models.LdapConfigs.getLdapConfig(),
      subdomain,
    );
  },

  async authLdapTestConnection(
    _parent: undefined,
    { input, identifier }: { input: LdapConfigInput; identifier?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    const connection = await models.LdapConfigs.getConnectionConfig(input);

    return testLdapConnection(connection, identifier?.trim() || undefined);
  },

  async authLdapLinkUser(
    _parent: undefined,
    { userId, identifier }: { userId: string; identifier: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    await models.AuthIdentities.linkLdapUser(userId, identifier.trim());

    return true;
  },

  async authLdapUnlinkUser(
    _parent: undefined,
    { userId }: { userId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    return models.AuthIdentities.unlinkLdapUser(userId);
  },
};
