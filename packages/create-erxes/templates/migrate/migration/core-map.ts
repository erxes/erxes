// What an old erxes call into core becomes on the new core. Built from what
// erxes `postgre` opens to plugins: packages/contract and the access map in
// apps/api/src/http/access.ts. Old calls run on the server, so:
//
//   sdk           core.forOrg(orgId).<procedure> from the API, with the scope named
//   contract      no plugin scope; the UI calls core with the member's own session
//   plugin-owned  the plugin keeps it in its own tables or code
//   gap           core offers no equivalent yet: file it, don't work around it

export type Equivalent = {
  kind: 'sdk' | 'contract' | 'plugin-owned' | 'gap';
  /** The procedure, function or place it moves to. */
  to: string;
  note?: string;
};

const sdk = (to: string, note?: string): Equivalent => ({ kind: 'sdk', to, note });
const contract = (to: string, note?: string): Equivalent => ({ kind: 'contract', to, note });
const owned = (to: string, note?: string): Equivalent => ({ kind: 'plugin-owned', to, note });
const gap = (note: string): Equivalent => ({ kind: 'gap', to: '', note });

/** `sendTRPCMessage({ pluginName: 'core', module, action })`, keyed `module.action`. */
export const CORE_CALLS: Record<string, Equivalent> = {
  'customers.findOne': sdk('customers.get', 'scope customers:read; by id only'),
  'customers.find': contract(
    'customers.list',
    'member needs contacts.view; no plugin scope lists customers',
  ),
  'customers.createCustomer': sdk(
    'customers.findOrCreate',
    'scope customers:write; by email or phone',
  ),
  'customers.createMessengerCustomer': sdk('customers.findOrCreate', 'scope customers:write'),
  'customers.getWidgetCustomer': sdk(
    'customers.findOrCreate',
    'scope customers:write; by email or phone',
  ),
  'customers.updateCustomer': gap('plugins cannot change a customer'),
  'customers.updateOne': gap('plugins cannot change a customer'),
  'customers.updateMessengerCustomer': gap('plugins cannot change a customer'),
  'customers.updateLocation': gap('plugins cannot change a customer'),
  'customers.updateSession': gap('plugins cannot change a customer'),
  'customers.markCustomerAsActive': gap('plugins cannot change a customer'),
  'customers.findActiveCustomers': gap('plugins cannot list or search customers'),
  'companies.findOne': sdk('companies.get', 'scope customers:read; by id only'),
  'companies.find': contract('companies.list', 'member needs contacts.view'),
  'companies.createCompany': gap('plugins cannot create companies'),
  'companies.updateCompany': gap('plugins cannot change a company'),
  'users.findOne': contract('users.get', 'member needs team.view; keep user ids on the server'),
  'users.find': contract('users.list', 'member needs team.view; keep user ids on the server'),
  'users.getIds': contract('users.list', 'member needs team.view'),
  'tags.find': owned('<plugin>_tags', "core's tags are for customers and companies (decision 9)"),
  'tags.findOne': owned(
    '<plugin>_tags',
    "core's tags are for customers and companies (decision 9)",
  ),
  'fields.find': owned(
    '<plugin>_fields',
    'core custom fields cover customers, companies and products',
  ),
  'fields.validateFieldValues': owned('zod in the procedure input'),
  'fields.getFieldList': owned('<plugin>_fields'),
  'fields.generateTypedListFromMap': owned('<plugin>_fields'),
  'fields.generatePropertiesData': owned('<plugin>_fields'),
  'fields.fieldsCombinedByContentType': owned('<plugin>_fields'),
  'fieldsGroups.find': owned('<plugin>_fields'),
  'configs.getConfig': owned(
    '<plugin>_settings',
    'country and currency: organizations.current (sdk)',
  ),
  'configs.getConfigs': owned(
    '<plugin>_settings',
    'country and currency: organizations.current (sdk)',
  ),
  'config.getConfig': owned(
    '<plugin>_settings',
    'country and currency: organizations.current (sdk)',
  ),
  'activityLog.createActivityLog': sdk(
    'activities.create',
    'scope activities:write; customer or company targets, else manifest timelines',
  ),
  'notifications.send': sdk('notifications.create', 'scope notifications:write; team members only'),
  'core.sendEmail': gap('no email API for plugins; team members: notifications.create'),
  'emailDeliveries.create': gap('no email API for plugins'),
  'emailDeliveries.recordHandoff': gap('no email API for plugins'),
  'emailSuppression.blocked': gap('no email API for plugins'),
  'cpUsers.get': gap('customer sign-in (decision 42) has no plugin procedure yet'),
  'cpNotifications.create': gap('customer sign-in (decision 42) has no plugin procedure yet'),
  'clientPortals.get': gap('core has no client portals'),
  'segment.fetchSegment': gap('core has saved views, not segments, and none for plugins'),
  'automation.find': gap(
    'plugins declare manifest events and actions; they cannot read automations',
  ),
  'brands.create': gap('core has no brands'),
  'brands.updateOne': gap('core has no brands'),
  'branches.findOne': gap('core has no branches'),
  'departments.findWithChild': gap('core has no departments'),
  'organization.identity': owned('nothing', 'the organisation id is in every token (orgId)'),
};

/** Event, audit and automation helpers from erxes-api-shared. */
export const HELPERS: Record<string, Equivalent> = {
  sendDbEventLog: sdk(
    'core_record_audit() in the same transaction',
    'or audit.record (audit:write)',
  ),
  sendEvent: sdk(
    'core_publish_event() in the same transaction',
    'declare the type in manifest.events',
  ),
  sendNotification: sdk(
    'notifications.create',
    'scope notifications:write; kind in manifest.notificationKinds',
  ),
  sendNotifications: sdk('notifications.create', 'scope notifications:write'),
  sendAutomationTrigger: sdk(
    'core_publish_event() in the same transaction',
    'declare the type in manifest.events; automations start from events',
  ),
  sendAutomationDeferredCompletion: gap(
    'an automation action answers in its HTTP response; core has no deferred completion',
  ),
};

/** Meta registrations in `startPlugin({ meta })` and `meta/`. */
export const REGISTRATIONS: Record<string, Equivalent> = {
  permission: sdk(
    'manifest.permissions',
    '<plugin>.<record>.<verb>; own/team/all reach stays in the plugin',
  ),
  notification: sdk('manifest.notificationKinds'),
  'automation trigger': sdk('manifest.events', 'published with core_publish_event()'),
  'automation action': sdk(
    'manifest.actions',
    'POST <api>/automations/actions/<type>, verifyCoreCall()',
  ),
  'default role': gap('core roles are its own; a plugin cannot ship a role with grants'),
  segment: gap('core has no segments for plugins'),
  'import-export': gap("core's import and export cover contacts only"),
};

/** A call to another plugin, or to this one through tRPC. */
export const pluginCall = (target: string, self: string): Equivalent =>
  target === self
    ? owned('a direct function call')
    : gap(`plugins cannot call ${target}; listen to its events instead`);

export const UNMAPPED = gap('not in migration/core-map.ts yet');
