import { IContext } from '~/connectionResolvers';
import { ILdapConfigDocument } from '@/auth/db/definitions/ldap';
import { LdapConfigInput } from '@/auth/db/models/Ldap';
import { testLdapConnection } from '@/auth/ldap/client';
import { validatePermissionGroupIds } from '@/organization/team-member/graphql/mutations';

const LDAP_PERMISSION = 'permissionsManage';

// bindPassword is write-only: the API only says whether one is stored
const toLdapConfigResponse = (config: ILdapConfigDocument | null) =>
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
    updatedAt: config.updatedAt,
  };

export const ldapQueries = {
  async authLdapConfig(
    _parent: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(LDAP_PERMISSION);

    return toLdapConfigResponse(await models.LdapConfigs.getLdapConfig());
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
    { models, checkPermission }: IContext,
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

    return toLdapConfigResponse(await models.LdapConfigs.saveLdapConfig(input));
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
