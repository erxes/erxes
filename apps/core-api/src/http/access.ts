import { type coreContract, CORE_API_PREFIX, type PluginScope } from '@erxes/core-contract';
import type { AnyContractProcedure } from '@orpc/contract';
import type { Request } from 'express';
import { HttpError } from './errors';

type Contract = typeof coreContract;

/** Every procedure of the core API: `customers.list`, `plugins.token`, … */
export type ProcedurePath = {
  [G in keyof Contract]: `${G & string}.${keyof Contract[G] & string}`;
}[keyof Contract];

/** Which members: everyone, owners and admins, or owners only. */
export type MemberRule = 'any' | 'manager' | 'owner';

/**
 * Who may call a procedure. Nothing is allowed unless written here:
 * `member` for signed-in team members, `plugin` for plugin tokens with that
 * scope (`manifest`: the plugin's own deployment-wide token, no organisation).
 * Services may check more (a member's own note, an owner's account).
 */
export type Policy = { public: true } | { member?: MemberRule; plugin?: PluginScope | 'manifest' };

const MEMBER = { member: 'any' } as const;
const MANAGER = { member: 'manager' } as const;
const OWNER = { member: 'owner' } as const;
const PUBLIC = { public: true } as const;

/**
 * The access map: one entry per procedure, checked before the procedure runs.
 * `satisfies Record<ProcedurePath, Policy>` makes a procedure without an entry
 * (or an entry without a procedure) a compile error.
 */
export const ACCESS = {
  'activities.list': MEMBER,
  'activities.addNote': MEMBER,
  'activities.updateNote': MEMBER,
  'activities.removeNote': MEMBER,
  'activities.create': { plugin: 'activities:write' },

  'audit.list': MANAGER,
  'audit.record': { plugin: 'audit:write' },
  'audit.verify': MANAGER,
  'audit.checkpoints': MANAGER,
  'audit.settings': MANAGER,
  'audit.updateSettings': OWNER,

  'auth.setupStatus': PUBLIC,
  'auth.setup': PUBLIC,
  'auth.signIn': PUBLIC,
  'auth.signOut': PUBLIC,
  'auth.signOutEverywhere': MEMBER,
  'auth.me': MEMBER,
  'auth.changePassword': MEMBER,
  'auth.signIns': MEMBER,

  'companies.list': MEMBER,
  'companies.get': MEMBER,
  'companies.create': MEMBER,
  'companies.update': MEMBER,
  'companies.remove': MANAGER,
  'companies.merge': MANAGER,
  'companies.tag': MEMBER,

  'customers.list': MEMBER,
  'customers.get': MEMBER,
  'customers.create': MEMBER,
  'customers.update': MEMBER,
  'customers.remove': MANAGER,
  'customers.merge': MANAGER,
  'customers.tag': MEMBER,
  'customers.companies': MEMBER,
  'customers.linkCompany': MEMBER,
  'customers.unlinkCompany': MEMBER,

  'events.publish': { plugin: 'events:write' },
  'events.list': MANAGER,
  'events.failures': MANAGER,
  'events.retryFailures': MANAGER,
  'events.dismissFailures': MANAGER,

  'fieldGroups.list': MEMBER,
  'fieldGroups.create': MANAGER,
  'fieldGroups.update': MANAGER,
  'fieldGroups.reorder': MANAGER,
  'fieldGroups.archive': MANAGER,
  'fieldGroups.restore': MANAGER,
  'fieldGroups.remove': MANAGER,

  'fields.list': MEMBER,
  'fields.usage': MEMBER,
  'fields.create': MANAGER,
  'fields.update': MANAGER,
  'fields.reorder': MANAGER,
  'fields.archive': MANAGER,
  'fields.restore': MANAGER,
  'fields.removeUnused': MANAGER,
  'fields.remove': MANAGER,

  'files.createUpload': { member: 'any', plugin: 'files:write' },
  'files.complete': { member: 'any', plugin: 'files:write' },
  'files.get': { member: 'any', plugin: 'files:read' },
  'files.list': { member: 'any', plugin: 'files:read' },
  'files.remove': { member: 'any', plugin: 'files:write' },
  'files.settings': MANAGER,
  'files.updateSettings': MANAGER,

  'notifications.list': MEMBER,
  'notifications.unreadCount': MEMBER,
  'notifications.markRead': MEMBER,
  'notifications.remove': MEMBER,
  'notifications.settings': MEMBER,
  'notifications.updateSettings': MEMBER,
  'notifications.create': { plugin: 'notifications:write' },

  'organizations.current': MEMBER,

  'plugins.token': PUBLIC,
  'plugins.registerManifest': { plugin: 'manifest' },
  'plugins.list': MEMBER,
  'plugins.install': OWNER,
  'plugins.uninstall': OWNER,
  'plugins.session': MEMBER,
  'plugins.signal': { plugin: 'live:write' },

  'tags.list': MEMBER,
  'tags.create': MEMBER,
  'tags.update': MEMBER,
  'tags.remove': MANAGER,

  'users.list': MEMBER,
  'users.get': MEMBER,
  'users.invite': MANAGER,
  'users.inviteMany': MANAGER,
  'users.update': MEMBER,
  'users.setPassword': MANAGER,
  'users.disable': MANAGER,
  'users.enable': MANAGER,
} as const satisfies Record<ProcedurePath, Policy>;

const ROLE_RANK = { member: 0, admin: 1, owner: 2 } as const;
const RULE_RANK = { any: 0, manager: 1, owner: 2 } as const;

const RULE_MESSAGE: Record<MemberRule, string> = {
  any: '',
  manager: 'Only owners and admins can do this',
  owner: 'Only owners can do this',
};

/** ACCESS by a path only known at runtime. */
const policies: Partial<Record<string, Policy>> = ACCESS;

/** Checks the caller against the procedure's policy (oRPC middleware, every call). */
export const enforceAccess = (path: string, req: Request) => {
  const policy = policies[path];

  if (!policy) {
    // Unreachable while ACCESS satisfies the contract; fail closed regardless.
    throw new HttpError(403, 'NOT_ALLOWED', 'This procedure has no access policy');
  }

  if ('public' in policy) return;

  if (req.actor) {
    if (!policy.member) throw new HttpError(403, 'PLUGIN_ONLY', 'Only plugins can do this');

    if (ROLE_RANK[req.actor.role] < RULE_RANK[policy.member]) {
      throw new HttpError(403, 'NOT_ALLOWED', RULE_MESSAGE[policy.member]);
    }

    return;
  }

  if (req.plugin || req.pluginService) {
    if (!policy.plugin) throw new HttpError(403, 'MEMBERS_ONLY', 'Plugins cannot do this');

    if (policy.plugin === 'manifest') {
      if (!req.pluginService) {
        throw new HttpError(
          403,
          'SERVICE_TOKEN_REQUIRED',
          'Use a token without an organisation to do this',
        );
      }

      return;
    }

    if (!req.plugin)
      throw new HttpError(403, 'ORG_REQUIRED', 'Use a token for an organisation to do this');

    if (!req.plugin.scopes.includes(policy.plugin)) {
      throw new HttpError(
        403,
        'SCOPE_REQUIRED',
        `This needs the ${policy.plugin} scope, which this installation hasn't granted`,
      );
    }

    return;
  }

  throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');
};

/** Paths (under /core/v1) that `authenticate` lets through without credentials. */
export const publicPaths = (contract: Contract) => {
  const paths = new Set<string>();

  for (const [group, procedures] of Object.entries(contract)) {
    for (const [name, procedure] of Object.entries<AnyContractProcedure>(procedures)) {
      const route = procedure['~orpc'].route.path;
      const policy = policies[`${group}.${name}`];

      if (route && policy && 'public' in policy) {
        paths.add(route.replace(CORE_API_PREFIX, ''));
      }
    }
  }

  return paths;
};
