import { DEFAULT_GRANT_ROLES } from '@erxes/core-db/enums';
import { roles } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { listOf } from './common';
import { RoleKey } from './values';

/**
 * What a member may do, as actions (`contacts.delete`). Roles are named sets
 * of them. Plugins add theirs through their manifest (`hr.leave.approve`).
 * `ownerOnly` actions belong to owners and can't be given to another role.
 */
export const CORE_PERMISSIONS = [
  { action: 'contacts.view', group: 'Contacts', label: 'See customers and companies' },
  { action: 'contacts.create', group: 'Contacts', label: 'Add customers and companies' },
  {
    action: 'contacts.edit',
    group: 'Contacts',
    label: 'Edit, tag and link customers and companies',
  },
  { action: 'contacts.delete', group: 'Contacts', label: 'Delete customers and companies' },
  { action: 'contacts.merge', group: 'Contacts', label: 'Merge duplicates' },
  {
    action: 'contacts.import',
    group: 'Contacts',
    label: 'Import customers and companies from files',
  },
  { action: 'contacts.export', group: 'Contacts', label: 'Export lists to CSV or Excel' },
  { action: 'notes.moderate', group: 'Contacts', label: "Edit and delete other people's notes" },
  { action: 'tags.manage', group: 'Tags', label: 'Create and rename tags' },
  { action: 'tags.delete', group: 'Tags', label: 'Delete tags' },
  { action: 'properties.manage', group: 'Properties', label: 'Manage custom fields and groups' },
  { action: 'files.moderate', group: 'Files', label: "Delete other people's files" },
  { action: 'team.view', group: 'Team', label: 'See team members' },
  { action: 'team.invite', group: 'Team', label: 'Invite team members' },
  {
    action: 'team.manage',
    group: 'Team',
    label: 'Edit members, change roles, reset passwords, disable',
  },
  { action: 'roles.manage', group: 'Team', label: 'Create and edit roles' },
  {
    action: 'structure.manage',
    group: 'Team',
    label: 'Add, change and remove branches and departments, and who is in them',
  },
  {
    action: 'settings.manage',
    group: 'Settings',
    label: 'Change organisation settings (file upload, …)',
  },
  {
    action: 'exchange_rates.manage',
    group: 'Settings',
    label: 'Add, change and delete exchange rates',
  },
  { action: 'audit.view', group: 'Security', label: 'See and export the audit log' },
  {
    action: 'events.view',
    group: 'Security',
    label: 'See the event stream and retry failed events',
  },
  { action: 'webhooks.manage', group: 'Integrations', label: 'Manage webhooks' },
  {
    action: 'api_keys.create',
    group: 'Integrations',
    label: 'Create API keys that act as themselves',
  },
  {
    action: 'api_keys.manage',
    group: 'Integrations',
    label: "See and revoke everyone's API keys",
  },
  {
    action: 'banks.view',
    group: 'Banks',
    label: "See the organisation's bank accounts, balances and statements",
  },
  {
    action: 'banks.transfer',
    group: 'Banks',
    label: "Send money from the organisation's bank accounts",
  },
  {
    action: 'integrations.manage',
    group: 'Integrations',
    label: 'Set up, turn on or off and remove integrations (eBarimt)',
  },
  {
    action: 'payments.manage',
    group: 'Payments',
    label: 'Connect payment gateways and see invoices',
  },
  { action: 'payments.refund', group: 'Payments', label: 'Refund payments' },
  {
    action: 'products.manage',
    group: 'Products',
    label: 'Add, edit and archive products and categories',
  },
  { action: 'assistant.chat', group: 'Assistant', label: 'Chat with the assistant' },
  {
    action: 'assistant.manage',
    group: 'Assistant',
    label: 'Choose when the assistant asks before acting',
  },
  {
    action: 'broadcasts.view',
    group: 'Broadcasts',
    label: 'See broadcasts, who got them and suppressed addresses',
  },
  {
    action: 'broadcasts.manage',
    group: 'Broadcasts',
    label: 'Write, test and delete broadcasts; suppress addresses',
  },
  {
    action: 'broadcasts.send',
    group: 'Broadcasts',
    label: 'Send, schedule, pause and cancel broadcasts',
  },
  { action: 'automations.view', group: 'Automations', label: 'See automations and their runs' },
  {
    action: 'automations.manage',
    group: 'Automations',
    label: 'Create, change and turn automations on or off',
  },
  {
    action: 'audit.retention',
    group: 'Security',
    label: 'Change how long the audit log is kept',
    ownerOnly: true,
  },
  {
    action: 'audit.stream',
    group: 'Security',
    label: 'Stream the audit log to a log service',
    ownerOnly: true,
  },
  {
    action: 'plugins.manage',
    group: 'Plugins',
    label: 'Install, uninstall and approve plugins',
    ownerOnly: true,
  },
  {
    action: 'trash.purge',
    group: 'Contacts',
    label: 'Delete from the recycle bin for good',
    ownerOnly: true,
  },
] as const satisfies readonly {
  action: string;
  group: string;
  label: string;
  ownerOnly?: boolean;
}[];

export type CorePermission = (typeof CORE_PERMISSIONS)[number]['action'];

/**
 * The first word of core's actions (`team`, `payments`, …): no plugin is named one, since a
 * plugin's permissions start with its name and would read as core's.
 */
export const CORE_PERMISSION_AREAS: ReadonlySet<string> = new Set(
  CORE_PERMISSIONS.map(({ action }) => action.slice(0, action.indexOf('.'))),
);

/** Owner-only core actions: never granted to another role. */
export const OWNER_ONLY_PERMISSIONS: readonly string[] = CORE_PERMISSIONS.filter(
  (permission) => 'ownerOnly' in permission && permission.ownerOnly,
).map((permission) => permission.action);

/** `contacts.delete`, `hr.leave.approve`, or `*` (everything grantable). */
export const PermissionAction = z
  .string()
  .trim()
  .regex(/^(\*|[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+)$/, 'an action like contacts.delete');

export const Role = createSelectSchema(roles)
  .pick({ key: true, name: true, description: true, permissions: true, builtin: true })
  .extend({
    /** Owner and Admin are fixed; Member and custom roles can be edited. */
    editable: z.boolean(),
    members: z.int(),
  });

export type Role = z.infer<typeof Role>;

export const PermissionInfo = z.object({
  action: z.string(),
  group: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  /** `core` or the plugin that brings it. */
  source: z.string(),
  ownerOnly: z.boolean(),
});

export type PermissionInfo = z.infer<typeof PermissionInfo>;

/** A plugin's ready-made bundle of its permissions (`frontline` `agent`), added to a role at once. */
/** A bundle of a plugin's own permissions, as its manifest declares it. */
export const ManifestPermissionSet = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
  label: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional(),
  permissions: z.array(PermissionAction).min(1).max(500),
  /**
   * Built-in roles that get the set by default: `member` (Owner and Admin have everything
   * already). Core adds its permissions to the role where the plugin is installed, and adds a
   * permission the set gains later. It never takes one back, so an owner's changes stay.
   */
  defaultRoles: z.array(z.enum(DEFAULT_GRANT_ROLES)).max(1).optional(),
});

export const PermissionSet = z.object({
  /** The plugin that offers it. */
  source: z.string(),
  key: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  permissions: z.array(z.string()),
});

export type PermissionSet = z.infer<typeof PermissionSet>;

const RoleFields = createUpdateSchema(roles, {
  name: (name) => name.trim().min(1).max(60),
  description: (value) => value.trim().max(300),
  permissions: () => z.array(PermissionAction).max(1000),
}).pick({ name: true, description: true, permissions: true });

const {
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  FIXED_ROLE,
  LIMIT_EXCEEDED,
  OWNER_ONLY_PERMISSION,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  UNKNOWN_PERMISSION,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  FIXED_ROLE,
  LIMIT_EXCEEDED,
  OWNER_ONLY_PERMISSION,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  UNKNOWN_PERMISSION,
});

export const rolesContract = {
  list: base
    .route({
      method: 'GET',
      path: '/roles',
      summary: 'List roles',
      description: 'Roles of the organisation, with member counts',
    })
    .output(listOf(Role)),
  permissions: base
    .route({
      method: 'GET',
      path: '/permissions',
      summary: 'List permissions',
      description: "Every action a role can include: core's and installed plugins'",
    })
    .output(listOf(PermissionInfo)),
  permissionSets: base
    .route({
      method: 'GET',
      path: '/permission-sets',
      summary: 'List permission sets',
      description: "Installed plugins' ready-made bundles of their permissions, to add to a role",
    })
    .output(listOf(PermissionSet)),
  create: base
    .route({
      method: 'POST',
      path: '/roles',
      successStatus: 201,
      summary: 'Create a role',
      description: 'Create a role (roles.manage)',
    })
    .input(RoleFields.required({ name: true, permissions: true }))
    .output(Role),
  update: base
    .route({
      method: 'PATCH',
      path: '/roles/{key}',
      summary: 'Change a role',
      description: 'Rename a role or change its permissions (roles.manage; not Owner or Admin)',
    })
    .input(RoleFields.extend({ key: RoleKey }))
    .output(Role),
  remove: base
    .route({
      method: 'DELETE',
      path: '/roles/{key}',
      summary: 'Delete a role',
      description: 'Delete a custom role nobody has (roles.manage); 409 ROLE_IN_USE',
    })
    .input(z.object({ key: RoleKey }))
    .output(z.object({ ok: z.literal(true) })),
};
