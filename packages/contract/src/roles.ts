import { roles } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
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
    action: 'settings.manage',
    group: 'Settings',
    label: 'Change organisation settings (file upload, …)',
  },
  { action: 'audit.view', group: 'Security', label: 'See and export the audit log' },
  {
    action: 'events.view',
    group: 'Security',
    label: 'See the event stream and retry failed events',
  },
  { action: 'webhooks.manage', group: 'Integrations', label: 'Manage webhooks' },
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

const RoleFields = createUpdateSchema(roles, {
  name: (name) => name.trim().min(1).max(60),
  description: (value) => value.trim().max(300),
  permissions: () => z.array(PermissionAction).max(1000),
}).pick({ name: true, description: true, permissions: true });

export const rolesContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/roles',
      summary: 'Roles of the organisation, with member counts',
    })
    .output(listOf(Role)),
  permissions: oc
    .route({
      method: 'GET',
      path: '/permissions',
      summary: "Every action a role can include: core's and installed plugins'",
    })
    .output(listOf(PermissionInfo)),
  create: oc
    .route({
      method: 'POST',
      path: '/roles',
      successStatus: 201,
      summary: 'Create a role (roles.manage)',
    })
    .input(RoleFields.required({ name: true, permissions: true }))
    .output(Role),
  update: oc
    .route({
      method: 'PATCH',
      path: '/roles/{key}',
      summary: 'Rename a role or change its permissions (roles.manage; not Owner or Admin)',
    })
    .input(RoleFields.extend({ key: RoleKey }))
    .output(Role),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/roles/{key}',
      summary: 'Delete a custom role nobody has (roles.manage); 409 ROLE_IN_USE',
    })
    .input(z.object({ key: RoleKey }))
    .output(z.object({ ok: z.literal(true) })),
};
