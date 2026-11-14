// What an old erxes call into core becomes on the new core. Built from what
// erxes `postgre` opens to plugins: packages/contract and the access map in
// apps/api/src/http/access.ts. Old calls run on the server, so:
//
//   sdk           core.forOrg(orgId).<procedure> from the API, with the scope named
//   contract      no plugin scope; the UI calls core with the member's own session,
//                 through orpc from @erxes/core-contract/client
//   plugin-owned  the plugin keeps it in its own tables or code
//   gap           core offers no equivalent yet: file it, don't work around it
//   drop          left out on purpose (segments, the client portal, brands): remove the code

export type Equivalent = {
  kind: 'sdk' | 'contract' | 'plugin-owned' | 'gap' | 'drop';
  /** The procedure, function or place it moves to. */
  to: string;
  note?: string;
};

const sdk = (to: string, note?: string): Equivalent => ({ kind: 'sdk', to, note });
const contract = (to: string, note?: string): Equivalent => ({ kind: 'contract', to, note });
const owned = (to: string, note?: string): Equivalent => ({ kind: 'plugin-owned', to, note });
const gap = (note: string): Equivalent => ({ kind: 'gap', to: '', note });
const drop = (note: string): Equivalent => ({ kind: 'drop', to: '', note });

/**
 * Old core's structure (departments, branches, units, positions): core has none. A plugin that
 * used it keeps its own teams; migration/checklist.ts drafts the tables and the import.
 */
export const OWN_TEAMS = owned(
  '<plugin>_teams',
  "the plugin's departments and branches; members in <plugin>_team_members, names from users.list (users:read)",
);

/** A field holding old structure ids or switches: `departmentIds`, `branchId`, `isCheckBranch`. */
export const isStructureField = (name: string) =>
  /^(department|branch|unit|position)Ids?$|^isCheck(Department|Branch)$/.test(name);

const NO_SEGMENTS = drop('the new core has no segments; the plugin filters its own records');

/** What old code serving the client portal becomes: nothing, the new core has none. */
export const CLIENT_PORTAL = drop('the new core has no client portal');

/** Old core modules mapped as a whole, whatever the action: left out, or the plugin's own. */
export const WHOLE_MODULES: Record<string, Equivalent> = {
  segment: NO_SEGMENTS,
  segments: NO_SEGMENTS,
  branches: OWN_TEAMS,
  departments: OWN_TEAMS,
  units: OWN_TEAMS,
  positions: OWN_TEAMS,
  brands: drop('the new core has no brands; leave brand ids and names out'),
  clientPortal: CLIENT_PORTAL,
  clientPortals: CLIENT_PORTAL,
  clientPortalUsers: CLIENT_PORTAL,
  cpUsers: CLIENT_PORTAL,
  cpNotifications: CLIENT_PORTAL,
};

/** Starting automations for a record: they start from the events a plugin publishes. */
const START_AUTOMATIONS = sdk(
  'core_publish_event() in the same transaction',
  'declare the type in manifest.events; automations start from events',
);

/** Reading automations: plugins can't, so what the plugin needed from them is its own setting. */
const OWN_AUTOMATION = owned(
  '<plugin>_settings',
  "what the plugin read from an automation (a chatbot's menu, its get-started reply) is its own setting; automations act on its events",
);

/**
 * An old public Express route (webhooks, OAuth callbacks): the plugin serves it and works out
 * the organisation itself, before any `withOrg`.
 */
export const PUBLIC_ROUTE = owned(
  'a route on the plugin API',
  "organisation from the path (an id or key the plugin issued) or, for one address shared by every organisation (Meta's webhook), a lookup table listed in tools/no-org-id.sql; verify the sender's signature first",
);

/** Old code that served the client portal: files named after it, `cp*` GraphQL operations. */
export const isClientPortal = (entry: { file: string; name?: string }) =>
  /client-?portal|cp-?notifications?/i.test(entry.file) || /^cp[A-Z]/.test(entry.name ?? '');

/** `sendTRPCMessage({ pluginName: 'core', module, action })`, keyed `module.action`. */
export const CORE_CALLS: Record<string, Equivalent> = {
  'customers.findOne': sdk('customers.get', 'scope customers:read; by id only'),
  'customers.find': sdk(
    'customers.list',
    'scope customers:read; search, ids, state, tagIds, companyId, filter',
  ),
  'customers.findActiveCustomers': sdk('customers.list', 'scope customers:read'),
  'customers.removeCustomers': contract(
    'customers.remove',
    'members with contacts.delete only; plugins never delete contacts',
  ),
  'customers.createCustomer': sdk(
    'customers.findOrCreate',
    "scope customers:write; by email or phone, else customers.create (state: 'lead')",
  ),
  'customers.createMessengerCustomer': sdk(
    'customers.findOrCreate',
    "scope customers:write; state: 'lead', source: 'chat'",
  ),
  'customers.getWidgetCustomer': sdk(
    'customers.findOrCreate',
    'scope customers:write; by email or phone',
  ),
  'customers.updateCustomer': sdk('customers.update', 'scope customers:write'),
  'customers.updateOne': sdk('customers.update', 'scope customers:write'),
  'customers.updateMessengerCustomer': sdk(
    'customers.update',
    'scope customers:write; messenger session data (last seen, online, location) stays in the plugin',
  ),
  'customers.updateLocation': owned(
    '<plugin>_customers',
    "the visitor's location is messenger session data",
  ),
  'customers.updateSession': owned('<plugin>_customers', 'messenger session data'),
  'customers.markCustomerAsActive': owned('<plugin>_customers', 'messenger session data'),
  'companies.findOne': sdk('companies.get', 'scope customers:read; by id only'),
  'companies.find': sdk('companies.list', 'scope customers:read'),
  'companies.createCompany': sdk('companies.create', 'scope customers:write'),
  'companies.updateCompany': sdk('companies.update', 'scope customers:write'),
  'conformity.savedConformity': owned(
    "customerId / companyId columns (or a join table) on the plugin's record",
    'customer ↔ company links: customers.linkCompany (customers:write)',
  ),
  'users.findOne': sdk('users.get', 'scope users:read'),
  'users.find': sdk('users.list', 'scope users:read; search, ids, isActive, role'),
  'users.getIds': sdk('users.list', 'scope users:read'),
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
  'core.sendEmail': sdk(
    'emails.send',
    'scope emails:write; plain text, up to 50 addresses, replyTo; team members: notifications.create',
  ),
  'emailDeliveries.create': owned(
    '<plugin>_email_deliveries',
    "mail sent from the organisation's own mailbox is the plugin's to log",
  ),
  'emailDeliveries.recordHandoff': owned('<plugin>_email_deliveries'),
  'emailSuppression.blocked': owned(
    '<plugin>_email_suppressions',
    'bounces and opt-outs the plugin hears from its mailbox',
  ),
  'automation.find': OWN_AUTOMATION,
  'branches.findOne': OWN_TEAMS,
  'departments.findWithChild': OWN_TEAMS,
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
  sendAutomationTrigger: START_AUTOMATIONS,
  sendAutomationDeferredCompletion: owned(
    'the action answers at once ({ queued: true, jobId })',
    'the plugin keeps the final result on its own job row, and on the timeline with activities.create',
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
  'default role': sdk(
    'manifest.permissionSets',
    'a set of its permissions an owner adds to any role; members keep one role',
  ),
  segment: NO_SEGMENTS,
  'import-export': gap("core's import and export cover contacts only"),
};

/**
 * A call to another plugin, or to this one through tRPC. The old automations plugin is core's
 * automations now: its `trigger` is an event, and what a plugin read from it is its own setting.
 */
export const pluginCall = (target: string, self: string, action: string): Equivalent => {
  if (target === self) return owned('a direct function call');

  if (target === 'automations') return action === 'trigger' ? START_AUTOMATIONS : OWN_AUTOMATION;

  return gap(`plugins cannot call ${target}; listen to its events instead`);
};

export const UNMAPPED = gap('not in migration/core-map.ts yet');
