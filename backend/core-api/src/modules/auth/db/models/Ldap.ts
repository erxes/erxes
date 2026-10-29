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
  ILdapRecheckChange,
  ILdapRecheckRun,
  LDAP_RECHECK_MINUTES,
  LdapRecheckReason,
  ldapConfigSchema,
} from '@/auth/db/definitions/ldap';
import {
  IDirectoryState,
  isSecureLdapTransport,
  LdapConnectionConfig,
  lookupLdapUser,
  readDirectoryStates,
  verifyLdapCredentials,
} from '@/auth/ldap/client';
import { LoginError } from '@/auth/loginError';
import { revokeUserSessions } from '@/auth/session';

export type LdapConfigInput = ILdapConfig & { bindPassword?: string };

export interface ILdapConfigModel extends Model<ILdapConfigDocument> {
  getLdapConfig(): Promise<ILdapConfigDocument | null>;
  saveLdapConfig(doc: LdapConfigInput): Promise<ILdapConfigDocument>;
  getConnectionConfig(input?: LdapConfigInput): Promise<LdapConnectionConfig>;
  recordRecheck(
    run: ILdapRecheckRun,
    changes: ILdapRecheckChange[],
  ): Promise<void>;
}

const RECHECK_CHANGES_KEPT = 20;

export interface IAuthIdentityModel extends Model<IAuthIdentityDocument> {
  authenticateLdap(
    identifier: string,
    password: string,
  ): Promise<IUserDocument>;
  linkLdapUser(
    userId: string,
    identifier: string,
  ): Promise<IAuthIdentityDocument>;
  unlinkLdapUser(userId: string): Promise<boolean>;
  recheckLdapUsers(): Promise<ILdapRecheckRun | null>;
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

  if (!LDAP_RECHECK_MINUTES.includes(doc.recheckEveryMinutes)) {
    throw new Error('Recheck interval must be one of 0, 5, 15 or 60 minutes');
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
        recheckEveryMinutes: doc.recheckEveryMinutes,
        groupChangePolicy: doc.groupChangePolicy,
      };

      if (existing) {
        await models.LdapConfigs.updateOne(
          { _id: existing._id },
          { $set: update },
        );

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
        recheckEveryMinutes: source.recheckEveryMinutes ?? 15,
        groupChangePolicy: source.groupChangePolicy || 'updatePermissions',
        bindPassword,
      };
    }

    public static async recordRecheck(
      run: ILdapRecheckRun,
      changes: ILdapRecheckChange[],
    ) {
      await models.LdapConfigs.updateOne(
        {},
        {
          $set: { lastRecheck: run },
          ...(changes.length
            ? {
                $push: {
                  recheckChanges: {
                    $each: changes,
                    $position: 0,
                    $slice: RECHECK_CHANGES_KEPT,
                  },
                },
              }
            : {}),
        },
      );
    }
  }

  ldapConfigSchema.loadClass(LdapConfig);

  return ldapConfigSchema;
};

const mappedPermissionGroupIds = (
  config: ILdapConfig,
  groupDns: string[],
): string[] | null => {
  if (!config.groupMappings.length) {
    return null;
  }

  const ids = config.groupMappings
    .filter((mapping) =>
      groupDns.some((groupDn) => sameDn(groupDn, mapping.groupDn)),
    )
    .flatMap((mapping) => mapping.permissionGroupIds);

  return [...new Set(ids)];
};

const isInAllowedGroup = (config: ILdapConfig, groupDns: string[]) =>
  config.allowedGroupDns.some((allowedDn) =>
    groupDns.some((groupDn) => sameDn(groupDn, allowedDn)),
  );

/** Why a linked user may no longer sign in, judged the same way login judges it. */
export const lostAccessReason = (
  config: ILdapConfig,
  state?: IDirectoryState,
): LdapRecheckReason | null => {
  if (!state) {
    return 'removed';
  }

  if (state.disabled) {
    return 'disabled';
  }

  // With no allowed groups set, linked members keep access, as at login
  if (
    config.allowedGroupDns.length &&
    !isInAllowedGroup(config, state.groupDns)
  ) {
    return 'left_group';
  }

  return null;
};

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

const canLinkByEmail = (config: ILdapConfig, email: string) =>
  config.linkEmailDomains.includes(email.split('@').pop() || '');

export const loadAuthIdentityClass = (models: IModels, subdomain: string) => {
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
      const profile = await verifyLdapCredentials(
        connection,
        identifier,
        password,
      );

      const permissionGroupIds = mappedPermissionGroupIds(
        connection,
        profile.groupDns,
      );
      const identity = await models.AuthIdentities.findOne({
        provider: 'ldap',
        subject: profile.subject,
      });

      if (identity) {
        // Leaving an allowed group revokes access; with no groups set, linked members keep it
        if (
          connection.allowedGroupDns.length &&
          !isInAllowedGroup(connection, profile.groupDns)
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

      if (!profile.email || !isInAllowedGroup(connection, profile.groupDns)) {
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

    /**
     * Applies directory changes to linked users between logins: lost access ends
     * their sessions, moved mapped groups update permissions. An unreachable
     * directory changes nothing.
     */
    public static async recheckLdapUsers() {
      const config = await models.LdapConfigs.getLdapConfig();

      if (!config?.enabled) {
        return null;
      }

      const connection = await models.LdapConfigs.getConnectionConfig();
      const identities = await models.AuthIdentities.find(
        { provider: 'ldap' },
        { userId: 1, subject: 1 },
      ).lean();
      const at = new Date();

      let states: Map<string, IDirectoryState>;

      try {
        states = await readDirectoryStates(
          connection,
          identities.map((identity) => identity.subject),
        );
      } catch (e) {
        const failed: ILdapRecheckRun = {
          at,
          status: 'failed',
          error: (e as Error).message,
          checked: 0,
        };

        await models.LdapConfigs.recordRecheck(failed, []);

        return failed;
      }

      const users = await models.Users.find(
        { _id: { $in: identities.map((identity) => identity.userId) } },
        { permissionGroupIds: 1 },
      ).lean();
      const currentPermissions = new Map(
        users.map((user) => [user._id, user.permissionGroupIds || []]),
      );

      const applyState = async (
        userId: string,
        state?: IDirectoryState,
      ): Promise<ILdapRecheckChange | null> => {
        const reason = lostAccessReason(connection, state);

        // Recorded only when someone was actually signed out, so a user who
        // left long ago does not fill the history on every run
        if (reason) {
          const ended = await revokeUserSessions(subdomain, userId);

          return ended ? { userId, reason, signedOut: true, at } : null;
        }

        const permissionGroupIds =
          state && mappedPermissionGroupIds(connection, state.groupDns);

        if (
          !permissionGroupIds ||
          sameIds(currentPermissions.get(userId) || [], permissionGroupIds)
        ) {
          return null;
        }

        await models.Users.updateOne(
          { _id: userId },
          { $set: { permissionGroupIds } },
        );

        const signedOut =
          connection.groupChangePolicy === 'revokeSessions' &&
          (await revokeUserSessions(subdomain, userId)) > 0;

        return { userId, reason: 'permissions_changed', signedOut, at };
      };

      const changes = (
        await Promise.all(
          identities.map((identity) =>
            applyState(identity.userId, states.get(identity.subject)),
          ),
        )
      ).filter((change): change is ILdapRecheckChange => change !== null);

      const run: ILdapRecheckRun = {
        at,
        status: 'ok',
        checked: identities.length,
      };

      await models.LdapConfigs.recordRecheck(run, changes);

      return run;
    }
  }

  authIdentitySchema.loadClass(AuthIdentity);

  return authIdentitySchema;
};
