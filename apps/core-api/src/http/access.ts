import { type CorePermission, type coreContract, CORE_API_PREFIX, type PluginScope } from '@erxes/core-contract';
import type { Request } from 'express';
import { can } from './auth';
import { HttpError } from './errors';

type Contract = typeof coreContract;

/** Every procedure of the core API: `customers.list`, `plugins.token`, … */
export type ProcedurePath = { [G in keyof Contract]: `${G & string}.${keyof Contract[G] & string}` }[keyof Contract];

/** Which members: any signed-in member, or those whose role has this permission. */
export type MemberRule = 'any' | CorePermission;

/**
 * Who may call a procedure. Nothing is allowed unless written here:
 * `member` for signed-in team members (a permission their role must hold),
 * `plugin` for plugin tokens with that scope (`manifest`: the plugin's own
 * deployment-wide token, no organisation). Services may check more (a
 * member's own note, an owner's account).
 */
export type Policy = { public: true } | { member?: MemberRule; plugin?: PluginScope | 'manifest' };

const MEMBER = { member: 'any' } as const;
const PUBLIC = { public: true } as const;
const needs = <P extends CorePermission>(permission: P) => ({ member: permission }) as const;

/**
 * The access map: one entry per procedure, checked before the procedure runs.
 * `satisfies Record<ProcedurePath, Policy>` makes a procedure without an entry
 * (or an entry without a procedure) a compile error.
 */
export const ACCESS = {
  // Timelines check per target: contacts.view, or the plugin timeline's permission.
  'activities.list': MEMBER,
  'activities.addNote': MEMBER,
  'activities.updateNote': MEMBER,
  'activities.removeNote': MEMBER,
  'activities.logInteraction': MEMBER,
  'activities.react': MEMBER,
  'activities.types': MEMBER,
  'activities.update': { plugin: 'activities:write' },
  'activities.remove': { plugin: 'activities:write' },
  'activities.create': { plugin: 'activities:write' },

  'audit.list': needs('audit.view'),
  'audit.record': { plugin: 'audit:write' },
  'audit.verify': needs('audit.view'),
  'audit.checkpoints': needs('audit.view'),
  'audit.settings': needs('audit.view'),
  'audit.updateSettings': needs('audit.retention'),

  'auth.setupStatus': PUBLIC,
  'auth.setup': PUBLIC,
  'auth.signIn': PUBLIC,
  'auth.signOut': PUBLIC,
  'auth.signOutEverywhere': MEMBER,
  'auth.signInTwoFactor': PUBLIC,
  'auth.twoFactorSetup': MEMBER,
  'auth.twoFactorEnable': MEMBER,
  'auth.twoFactorDisable': MEMBER,
  'auth.twoFactorRecoveryCodes': MEMBER,
  'auth.requestPasswordReset': PUBLIC,
  'auth.resetPassword': PUBLIC,
  'auth.invitation': PUBLIC,
  'auth.acceptInvitation': PUBLIC,
  'auth.me': MEMBER,
  'auth.changePassword': MEMBER,
  'auth.signIns': MEMBER,

  'companies.list': needs('contacts.view'),
  'companies.get': { member: 'contacts.view', plugin: 'customers:read' },
  'companies.create': needs('contacts.create'),
  'companies.update': needs('contacts.edit'),
  'companies.remove': needs('contacts.delete'),
  'companies.merge': needs('contacts.merge'),
  'companies.tag': needs('contacts.edit'),

  'customers.list': needs('contacts.view'),
  'customers.get': { member: 'contacts.view', plugin: 'customers:read' },
  'customers.findOrCreate': { member: 'contacts.create', plugin: 'customers:write' },
  'customers.create': needs('contacts.create'),
  'customers.update': needs('contacts.edit'),
  'customers.remove': needs('contacts.delete'),
  'customers.merge': needs('contacts.merge'),
  'customers.tag': needs('contacts.edit'),
  'customers.companies': needs('contacts.view'),
  'customers.linkCompany': needs('contacts.edit'),
  'customers.unlinkCompany': needs('contacts.edit'),

  'events.publish': { plugin: 'events:write' },
  'events.list': needs('events.view'),
  'events.failures': needs('events.view'),
  'events.retryFailures': needs('events.view'),
  'events.dismissFailures': needs('events.view'),

  'fieldGroups.list': MEMBER,
  'fieldGroups.create': needs('properties.manage'),
  'fieldGroups.update': needs('properties.manage'),
  'fieldGroups.reorder': needs('properties.manage'),
  'fieldGroups.archive': needs('properties.manage'),
  'fieldGroups.restore': needs('properties.manage'),
  'fieldGroups.remove': needs('properties.manage'),

  'fields.list': MEMBER,
  'fields.usage': MEMBER,
  'fields.create': needs('properties.manage'),
  'fields.update': needs('properties.manage'),
  'fields.reorder': needs('properties.manage'),
  'fields.archive': needs('properties.manage'),
  'fields.restore': needs('properties.manage'),
  'fields.removeUnused': needs('properties.manage'),
  'fields.remove': needs('properties.manage'),

  'files.createUpload': { member: 'any', plugin: 'files:write' },
  'files.complete': { member: 'any', plugin: 'files:write' },
  'files.get': { member: 'any', plugin: 'files:read' },
  'files.list': { member: 'any', plugin: 'files:read' },
  'files.remove': { member: 'any', plugin: 'files:write' },
  'files.settings': needs('settings.manage'),
  'files.updateSettings': needs('settings.manage'),

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
  'plugins.install': needs('plugins.manage'),
  'plugins.uninstall': needs('plugins.manage'),
  'plugins.session': MEMBER,
  'plugins.signal': { plugin: 'live:write' },

  'tags.list': MEMBER,
  'tags.create': needs('tags.manage'),
  'tags.update': needs('tags.manage'),
  'tags.remove': needs('tags.delete'),

  'trash.list': needs('contacts.delete'),
  'trash.restore': needs('contacts.delete'),
  'trash.purge': needs('trash.purge'),

  'users.list': needs('team.view'),
  'users.get': needs('team.view'),
  'users.invite': needs('team.invite'),
  'users.inviteMany': needs('team.invite'),
  'users.resendInvitation': needs('team.invite'),
  'users.update': MEMBER,
  'users.setPassword': needs('team.manage'),
  'users.disable': needs('team.manage'),
  'users.enable': needs('team.manage'),

  'automations.catalog': needs('automations.view'),
  'automations.list': needs('automations.view'),
  'automations.get': needs('automations.view'),
  'automations.create': needs('automations.manage'),
  'automations.update': needs('automations.manage'),
  'automations.activate': needs('automations.manage'),
  'automations.pause': needs('automations.manage'),
  'automations.remove': needs('automations.manage'),
  'automations.start': needs('automations.manage'),
  'automations.test': needs('automations.view'),
  'automations.stats': needs('automations.view'),
  'automations.versions': needs('automations.view'),
  'automations.restoreVersion': needs('automations.manage'),
  'automations.templates': needs('automations.view'),
  'automations.fields': needs('automations.view'),
  'automations.runs': needs('automations.view'),
  'automations.run': needs('automations.view'),
  'automations.retryRun': needs('automations.manage'),
  'automations.cancelRun': needs('automations.manage'),

  'payments.gateways': needs('payments.manage'),
  'payments.addGateway': needs('payments.manage'),
  'payments.updateGateway': needs('payments.manage'),
  'payments.removeGateway': needs('payments.manage'),
  'payments.createInvoice': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.getInvoice': { member: 'payments.manage', plugin: 'payments:read' },
  'payments.cancelInvoice': { member: 'payments.manage', plugin: 'payments:write' },
  'payments.invoices': needs('payments.manage'),
  'payments.payTestInvoice': needs('payments.manage'),

  'webhooks.eventTypes': MEMBER,
  'webhooks.list': needs('webhooks.manage'),
  'webhooks.create': needs('webhooks.manage'),
  'webhooks.update': needs('webhooks.manage'),
  'webhooks.remove': needs('webhooks.manage'),
  'webhooks.rotateSecret': needs('webhooks.manage'),
  'webhooks.test': needs('webhooks.manage'),
  'webhooks.deliveries': needs('webhooks.manage'),
  'webhooks.redeliver': needs('webhooks.manage'),

  'roles.list': MEMBER,
  'roles.permissions': MEMBER,
  'roles.create': needs('roles.manage'),
  'roles.update': needs('roles.manage'),
  'roles.remove': needs('roles.manage'),
} as const satisfies Record<ProcedurePath, Policy>;


/** Checks the caller against the procedure's policy (oRPC middleware, every call). */
export const enforceAccess = (path: string, req: Request) => {
  const policy = (ACCESS as Record<string, Policy>)[path];

  if (!policy) {
    // Unreachable while ACCESS satisfies the contract; fail closed regardless.
    throw new HttpError(403, 'NOT_ALLOWED', 'This procedure has no access policy');
  }

  if ('public' in policy) return;

  if (req.actor) {
    if (!policy.member) throw new HttpError(403, 'PLUGIN_ONLY', 'Only plugins can do this');

    if (policy.member !== 'any' && !can(req.actor, policy.member)) {
      throw new HttpError(403, 'NOT_ALLOWED', "Your role doesn't allow this", { permission: policy.member });
    }

    return;
  }

  if (req.plugin || req.pluginService) {
    if (!policy.plugin) throw new HttpError(403, 'MEMBERS_ONLY', 'Plugins cannot do this');

    if (policy.plugin === 'manifest') {
      if (!req.pluginService) {
        throw new HttpError(403, 'SERVICE_TOKEN_REQUIRED', 'Use a token without an organisation to do this');
      }

      return;
    }

    if (!req.plugin) throw new HttpError(403, 'ORG_REQUIRED', 'Use a token for an organisation to do this');

    if (!req.plugin.scopes.includes(policy.plugin)) {
      throw new HttpError(403, 'SCOPE_REQUIRED', `This needs the ${policy.plugin} scope, which this installation hasn't granted`);
    }

    return;
  }

  throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');
};

/** Paths (under /core/v1) that `authenticate` lets through without credentials. */
export const publicPaths = (contract: Contract): Set<string> => {
  const paths = new Set<string>();

  for (const [path, policy] of Object.entries(ACCESS)) {
    if (!('public' in policy)) continue;

    const [group, name] = path.split('.') as [keyof Contract, string];
    const procedure = (contract[group] as Record<string, { '~orpc': { route: { path?: string } } }>)[name]!;

    paths.add(procedure['~orpc'].route.path!.replace(CORE_API_PREFIX, ''));
  }

  return paths;
};
