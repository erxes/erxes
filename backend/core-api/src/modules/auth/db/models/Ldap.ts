import { IUserDocument } from 'erxes-api-shared/core-types';
import { FilterParser } from 'ldapts';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { openSecret, sealSecret } from '@/agents/secretBox';
import {
  authIdentitySchema,
  IAuthIdentityDocument,
  ILdapConfig,
  ILdapConfigDocument,
  ldapConfigSchema,
} from '@/auth/db/definitions/ldap';
import {
  ILdapProfile,
  isSecureLdapTransport,
  LdapConnectionConfig,
  lookupLdapUser,
  verifyLdapCredentials,
} from '@/auth/ldap/client';
import { LoginError } from '@/auth/loginError';

export type LdapConfigInput = ILdapConfig & { bindPassword?: string };

export interface ILdapConfigModel extends Model<ILdapConfigDocument> {
  getLdapConfig(): Promise<ILdapConfigDocument | null>;
  saveLdapConfig(doc: LdapConfigInput): Promise<ILdapConfigDocument>;
  getConnectionConfig(input?: LdapConfigInput): Promise<LdapConnectionConfig>;
}

export interface IAuthIdentityModel extends Model<IAuthIdentityDocument> {
  authenticateLdap(
    identifier: string,
    password: string,
  ): Promise<IUserDocument>;
  linkLdapUser(userId: string, identifier: string): Promise<IAuthIdentityDocument>;
  unlinkLdapUser(userId: string): Promise<boolean>;
}

const normalizeList = (values?: string[]) => [
  ...new Set((values || []).map((value) => value.trim()).filter(Boolean)),
];

const sameDn = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const validateLdapConfig = (doc: LdapConfigInput) => {
  if (!doc.enabled) {
    return;
  }

  if (!doc.url || !doc.bindDn || !doc.baseDn || !doc.loginAttribute) {
    throw new Error('Url, bind DN, base DN and login attribute are required');
  }

  if (!isSecureLdapTransport(doc)) {
    throw new Error('Use an ldaps:// url, or ldap:// with StartTLS enabled');
  }

  if (doc.userFilter) {
    try {
      FilterParser.parseString(doc.userFilter);
    } catch {
      throw new Error('User filter is not a valid LDAP filter');
    }
  }
};

export const loadLdapConfigClass = (models: IModels) => {
  class LdapConfig {
    public static async getLdapConfig() {
      return models.LdapConfigs.findOne();
    }

    public static async saveLdapConfig(doc: LdapConfigInput) {
      const existing = await models.LdapConfigs.findOne();

      const sealedPassword = doc.bindPassword
        ? sealSecret(doc.bindPassword)
        : existing?.bindPassword;

      if (doc.enabled && !sealedPassword) {
        throw new Error('Bind password is required');
      }

      validateLdapConfig(doc);

      const update = {
        enabled: doc.enabled,
        serverType: doc.serverType,
        url: doc.url?.trim(),
        startTls: doc.startTls,
        bindDn: doc.bindDn,
        bindPassword: sealedPassword,
        baseDn: doc.baseDn,
        loginAttribute: doc.loginAttribute,
        userFilter: doc.userFilter,
        allowedGroupDns: normalizeList(doc.allowedGroupDns),
        linkEmailDomains: normalizeList(
          (doc.linkEmailDomains || []).map((domain) =>
            domain.trim().toLowerCase().replace(/^@/, ''),
          ),
        ),
        groupMappings: (doc.groupMappings || [])
          .map((mapping) => ({
            groupDn: mapping.groupDn.trim(),
            permissionGroupIds: normalizeList(mapping.permissionGroupIds),
          }))
          .filter((mapping) => mapping.groupDn),
      };

      if (existing) {
        await models.LdapConfigs.updateOne({ _id: existing._id }, { $set: update });

        return models.LdapConfigs.findOne({ _id: existing._id });
      }

      return models.LdapConfigs.create(update);
    }

    /** Test input may omit the password to reuse the stored one. */
    public static async getConnectionConfig(input?: LdapConfigInput) {
      const stored = await models.LdapConfigs.findOne().lean();
      const source = input || stored;

      if (!source) {
        throw new Error('LDAP is not configured');
      }

      const bindPassword =
        input?.bindPassword || openSecret(stored?.bindPassword) || '';

      return {
        enabled: source.enabled,
        serverType: source.serverType,
        url: source.url,
        startTls: source.startTls,
        bindDn: source.bindDn,
        baseDn: source.baseDn,
        loginAttribute: source.loginAttribute,
        userFilter: source.userFilter,
        allowedGroupDns: source.allowedGroupDns || [],
        linkEmailDomains: source.linkEmailDomains || [],
        groupMappings: source.groupMappings || [],
        bindPassword,
      };
    }
  }

  ldapConfigSchema.loadClass(LdapConfig);

  return ldapConfigSchema;
};

const mappedPermissionGroupIds = (
  config: ILdapConfig,
  profile: ILdapProfile,
): string[] | null => {
  if (!config.groupMappings.length) {
    return null;
  }

  const ids = config.groupMappings
    .filter((mapping) =>
      profile.groupDns.some((groupDn) => sameDn(groupDn, mapping.groupDn)),
    )
    .flatMap((mapping) => mapping.permissionGroupIds);

  return [...new Set(ids)];
};

const isAllowedToProvision = (config: ILdapConfig, profile: ILdapProfile) =>
  config.allowedGroupDns.some((allowedDn) =>
    profile.groupDns.some((groupDn) => sameDn(groupDn, allowedDn)),
  );

const canLinkByEmail = (config: ILdapConfig, email: string) =>
  config.linkEmailDomains.includes(email.split('@').pop() || '');

export const loadAuthIdentityClass = (models: IModels) => {
  class AuthIdentity {
    /**
     * Returns the erxes user for valid directory credentials, creating one on
     * first login when the profile is in an allowed group, or linking an
     * existing account whose email is in a link domain.
     */
    public static async authenticateLdap(identifier: string, password: string) {
      const config = await models.LdapConfigs.getLdapConfig();

      if (!config?.enabled) {
        throw new LoginError('invalid_credentials');
      }

      const connection = await models.LdapConfigs.getConnectionConfig();
      const profile = await verifyLdapCredentials(connection, identifier, password);

      const permissionGroupIds = mappedPermissionGroupIds(connection, profile);
      const identity = await models.AuthIdentities.findOne({
        provider: 'ldap',
        subject: profile.subject,
      });

      if (identity) {
        // Leaving an allowed group revokes access; with no groups set, linked members keep it
        if (
          connection.allowedGroupDns.length &&
          !isAllowedToProvision(connection, profile)
        ) {
          throw new LoginError('not_allowed');
        }

        const user = await models.Users.findOne({ _id: identity.userId });

        if (!user || user.isActive === false) {
          throw new LoginError('directory_disabled');
        }

        await models.AuthIdentities.updateOne(
          { _id: identity._id },
          { $set: { dn: profile.dn, lastLoginAt: new Date() } },
        );

        if (permissionGroupIds) {
          await models.Users.updateOne(
            { _id: user._id },
            { $set: { permissionGroupIds } },
          );
        }

        return models.Users.getUser(user._id);
      }

      if (!profile.email || !isAllowedToProvision(connection, profile)) {
        throw new LoginError('not_allowed');
      }

      const existing = await models.Users.findOne({ email: profile.email });

      if (existing) {
        // Matching email links only for domains the directory owns; otherwise an admin links
        if (
          !canLinkByEmail(connection, profile.email) ||
          existing.isOwner ||
          existing.isActive === false ||
          (await models.Users.isDirectoryUser(existing._id))
        ) {
          throw new LoginError('not_linked');
        }

        await models.AuthIdentities.create({
          userId: existing._id,
          provider: 'ldap',
          subject: profile.subject,
          dn: profile.dn,
          lastLoginAt: new Date(),
        });

        if (permissionGroupIds) {
          await models.Users.updateOne(
            { _id: existing._id },
            { $set: { permissionGroupIds } },
          );
        }

        return models.Users.getUser(existing._id);
      }

      const user = await models.Users.createProvisionedUser({
        email: profile.email,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        permissionGroupIds: permissionGroupIds || [],
      });

      await models.AuthIdentities.create({
        userId: user._id,
        provider: 'ldap',
        subject: profile.subject,
        dn: profile.dn,
        lastLoginAt: new Date(),
      });

      return user;
    }

    public static async linkLdapUser(userId: string, identifier: string) {
      const user = await models.Users.getUser(userId);

      if (user.isOwner) {
        throw new Error('The owner signs in with a local password');
      }

      const connection = await models.LdapConfigs.getConnectionConfig();
      const profile = await lookupLdapUser(connection, identifier);

      if (!profile) {
        throw new Error('Directory user not found');
      }

      const linked = await models.AuthIdentities.findOne({
        provider: 'ldap',
        subject: profile.subject,
      });

      if (linked && linked.userId !== userId) {
        throw new Error('This directory user is linked to another team member');
      }

      await models.AuthIdentities.updateOne(
        { provider: 'ldap', userId },
        { $set: { subject: profile.subject, dn: profile.dn } },
        { upsert: true },
      );

      const identity = await models.AuthIdentities.findOne({
        provider: 'ldap',
        userId,
      });

      if (!identity) {
        throw new Error('Could not link the directory user');
      }

      return identity;
    }

    public static async unlinkLdapUser(userId: string) {
      await models.AuthIdentities.deleteOne({ provider: 'ldap', userId });

      return true;
    }
  }

  authIdentitySchema.loadClass(AuthIdentity);

  return authIdentitySchema;
};
