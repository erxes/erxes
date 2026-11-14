import type { CorePermission, coreContract, PluginScope } from '@erxes/core-contract';

type Contract = typeof coreContract;

/** Every procedure of the core API: `customers.list`, `plugins.token`, … */
type ProcedurePath = {
  [G in keyof Contract]: `${G & string}.${keyof Contract[G] & string}`;
}[keyof Contract];

/** Which members: any signed-in member, or those whose role has this permission. */
type MemberRule = 'any' | CorePermission;

/**
 * Who may call a procedure. Nothing is allowed unless written here:
 * `member` for signed-in team members (a permission their role must hold),
 * `plugin` for plugin tokens with that scope (`manifest`: the plugin's own
 * deployment-wide token, no organisation; `installed`: any token for an
 * organisation that has it, no scope needed), `customer` for a signed-in
 * customer on `/customer/*` (`authenticate` lets nobody else in there).
 * Services may check more (a member's own note, an owner's account).
 */
export type Policy =
  | { public: true }
  | { customer: true }
  | { member?: MemberRule; plugin?: PluginScope | 'manifest' | 'installed' };

const MEMBER = { member: 'any' } as const;
const PUBLIC = { public: true } as const;
const CUSTOMER = { customer: true } as const;
const needs = <P extends CorePermission>(permission: P) => ({ member: permission }) as const;

/**
 * The access map: one entry per procedure, checked before the procedure runs
 * (`enforceAccess` in `./access`). `satisfies Record<ProcedurePath, Policy>`
 * makes a procedure without an entry (or an entry without a procedure) a
 * compile error.
 */
export const ACCESS = {
  // Timelines check per target: contacts.view, or the plugin timeline's permission.
  'activities.list': MEMBER,
  'activities.addNote': MEMBER,
  'activities.editNote': MEMBER,
  'activities.pinNote': MEMBER,
  'activities.noteVersions': MEMBER,
  'activities.removeNote': MEMBER,
  'activities.react': MEMBER,
  'activities.types': MEMBER,
  'activities.update': { plugin: 'activities:write' },
  'activities.remove': { plugin: 'activities:write' },
  'activities.create': { plugin: 'activities:write' },

  'assistant.connections': needs('assistant.chat'),
  'assistant.saveConnection': needs('assistant.chat'),
  'assistant.removeConnection': needs('assistant.chat'),
  'assistant.setDefaultProvider': needs('assistant.chat'),
  'assistant.models': needs('assistant.chat'),
  'assistant.verifyModel': needs('assistant.chat'),
  'assistant.threads': needs('assistant.chat'),
  'assistant.thread': needs('assistant.chat'),
  'assistant.updateThread': needs('assistant.chat'),
  'assistant.removeThread': needs('assistant.chat'),
  'assistant.reference': needs('assistant.chat'),
  'assistant.record': needs('assistant.chat'),
  'assistant.settings': needs('assistant.chat'),
  'assistant.updateSettings': needs('assistant.manage'),
  'assistant.appearance': needs('assistant.chat'),
  'assistant.updateAppearance': needs('assistant.chat'),

  'audit.list': needs('audit.view'),
  'audit.record': { plugin: 'audit:write' },
  'audit.verify': needs('audit.view'),
  'audit.checkpoints': needs('audit.view'),
  'audit.settings': needs('audit.view'),
  'audit.updateSettings': needs('audit.retention'),
  'audit.streams': needs('audit.stream'),
  'audit.createStream': needs('audit.stream'),
  'audit.updateStream': needs('audit.stream'),
  'audit.removeStream': needs('audit.stream'),
  'audit.testStream': needs('audit.stream'),

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
  'transfer.columns': needs('contacts.view'),
  'transfer.imports': needs('contacts.import'),
  'transfer.import': needs('contacts.import'),
  'transfer.createImport': needs('contacts.import'),
  'transfer.updateImport': needs('contacts.import'),
  'transfer.checkImport': needs('contacts.import'),
  'transfer.startImport': needs('contacts.import'),
  'transfer.undoImport': needs('contacts.import'),
  'transfer.importRows': needs('contacts.import'),
  'transfer.exports': needs('contacts.export'),
  'transfer.createExport': needs('contacts.export'),
  // Views check per list: contacts.view for contact lists; every member sees products.
  'views.list': MEMBER,
  'views.create': MEMBER,
  'views.update': MEMBER,
  'views.remove': MEMBER,
  'views.fields': MEMBER,
  'saas.plan': MEMBER,
  'saas.pluginPlan': { plugin: 'installed' },
  'auth.onboarded': MEMBER,
  'auth.changePassword': MEMBER,
  'auth.signIns': MEMBER,

  'customerAuth.sendCode': PUBLIC,
  'customerAuth.signIn': PUBLIC,
  'customerAuth.refresh': PUBLIC,
  'customerAuth.signOut': PUBLIC,

  'customerAccount.me': CUSTOMER,
  'customerAccount.update': CUSTOMER,
  'customerAccount.logins': CUSTOMER,
  'customerAccount.addLogin': CUSTOMER,
  'customerAccount.confirmLogin': CUSTOMER,
  'customerAccount.removeLogin': CUSTOMER,
  'customerAccount.sessions': CUSTOMER,
  'customerAccount.revokeSession': CUSTOMER,
  'customerAccount.signOutEverywhere': CUSTOMER,

  'companies.list': { member: 'contacts.view', plugin: 'customers:read' },
  'companies.get': { member: 'contacts.view', plugin: 'customers:read' },
  'companies.create': { member: 'contacts.create', plugin: 'customers:write' },
  'companies.update': { member: 'contacts.edit', plugin: 'customers:write' },
  'companies.remove': needs('contacts.delete'),
  'companies.merge': needs('contacts.merge'),
  'companies.people': { member: 'contacts.view', plugin: 'customers:read' },
  'companies.linkPerson': needs('contacts.edit'),
  'companies.unlinkPerson': needs('contacts.edit'),
  'companies.tag': needs('contacts.edit'),

  'leads.stages': needs('contacts.view'),
  'leads.createStage': needs('properties.manage'),
  'leads.updateStage': needs('properties.manage'),
  'leads.reorderStages': needs('properties.manage'),
  'leads.removeStage': needs('properties.manage'),
  'leads.move': needs('contacts.edit'),
  'leads.convert': needs('contacts.edit'),
  'leads.history': needs('contacts.view'),
  'leads.report': needs('contacts.view'),

  'customers.list': { member: 'contacts.view', plugin: 'customers:read' },
  'customers.get': { member: 'contacts.view', plugin: 'customers:read' },
  'customers.findOrCreate': { member: 'contacts.create', plugin: 'customers:write' },
  'customers.create': { member: 'contacts.create', plugin: 'customers:write' },
  'customers.update': { member: 'contacts.edit', plugin: 'customers:write' },
  'customers.remove': needs('contacts.delete'),
  'customers.merge': needs('contacts.merge'),
  'customers.tag': needs('contacts.edit'),
  'customers.companies': { member: 'contacts.view', plugin: 'customers:read' },
  'customers.linkCompany': { member: 'contacts.edit', plugin: 'customers:write' },
  'customers.unlinkCompany': needs('contacts.edit'),

  'emails.send': { plugin: 'emails:write' },

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

  // Plugins read product fields only (the service refuses the rest).
  'fields.list': { member: 'any', plugin: 'products:read' },
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

  // Plugins read the country and currency (local rules, prices) of organisations that installed them.
  'organizations.current': { member: 'any', plugin: 'installed' },
  'organizations.update': needs('settings.manage'),

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

  'users.list': { member: 'team.view', plugin: 'users:read' },
  'users.get': { member: 'team.view', plugin: 'users:read' },
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
  'automations.check': needs('automations.view'),
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
  'payments.refund': { member: 'payments.refund', plugin: 'payments:write' },
  'payments.refunds': { member: 'payments.manage', plugin: 'payments:read' },
  'payments.pluginSettings': needs('payments.manage'),
  'payments.updatePluginSettings': needs('payments.manage'),
  'payments.payTestInvoice': needs('payments.manage'),

  'products.list': { member: 'any', plugin: 'products:read' },
  'products.get': { member: 'any', plugin: 'products:read' },
  'products.lookup': { member: 'any', plugin: 'products:read' },
  'products.create': { member: 'products.manage', plugin: 'products:write' },
  'products.update': { member: 'products.manage', plugin: 'products:write' },
  'products.use': { plugin: 'products:write' },
  'products.archive': { member: 'products.manage', plugin: 'products:write' },
  'products.restore': { member: 'products.manage', plugin: 'products:write' },
  'productCategories.list': { member: 'any', plugin: 'products:read' },
  'productCategories.create': { member: 'products.manage', plugin: 'products:write' },
  'productCategories.update': { member: 'products.manage', plugin: 'products:write' },
  'productCategories.remove': { member: 'products.manage', plugin: 'products:write' },

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
  'roles.permissionSets': MEMBER,
  'roles.create': needs('roles.manage'),
  'roles.update': needs('roles.manage'),
  'roles.remove': needs('roles.manage'),
} as const satisfies Record<ProcedurePath, Policy>;
