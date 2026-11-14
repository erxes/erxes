import {
  CORE_PERMISSIONS,
  OWNER_ONLY_PERMISSIONS,
  type PermissionInfo,
  type PermissionSet,
} from '@erxes/core-contract';
import {
  caller,
  type Db,
  db,
  newId,
  pluginInstallations,
  plugins,
  roles,
  users,
} from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, ne, notInArray, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';

/** The roles every organisation starts with. */
const BUILTIN_ROLES = [
  {
    key: 'owner',
    name: 'Owner',
    description: "Everything, including plugins and the audit log's retention",
    permissions: ['*'],
  },
  {
    key: 'admin',
    name: 'Admin',
    description: 'Everything except owner-only actions',
    permissions: ['*'],
  },
  {
    key: 'member',
    name: 'Member',
    description: 'Works with contacts and tags',
    permissions: ['contacts.view', 'contacts.create', 'contacts.edit', 'tags.manage', 'team.view'],
  },
] as const;

/** Owner and Admin are fixed: their meaning is "everything". */
const FIXED_ROLES = ['owner', 'admin'];
const FIXED = new Set(FIXED_ROLES);

export const seedRoles = (tx: Db, orgId: string) =>
  tx
    .insert(roles)
    .values(
      BUILTIN_ROLES.map((role) => ({
        ...role,
        permissions: [...role.permissions],
        orgId,
        builtin: true,
      })),
    )
    .onConflictDoNothing();

/** Roles with whether they can be edited and how many members (not disabled) hold them. */
const selectRoles = (client: Db) =>
  client
    .select({
      ...getTableColumns(roles),
      editable: sql<boolean>`${notInArray(roles.key, FIXED_ROLES)}`,
      members: client.$count(users, and(eq(users.role, roles.key), ne(users.status, 'disabled'))),
    })
    .from(roles);

const roleWithMembers = async (client: Db, key: string) =>
  oneRow(await selectRoles(client).where(eq(roles.key, key)).limit(1));

/** The manifests of the plugins this organisation has on. */
const installedManifests = (client: Db) =>
  client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

/** The installed plugins' ready-made bundles of their permissions. */
export const permissionSets = async (client: Db): Promise<PermissionSet[]> =>
  (await installedManifests(client)).flatMap((plugin) =>
    (plugin.manifest?.permissionSets ?? []).map((set) => ({
      source: plugin.name,
      key: set.key,
      label: set.label,
      description: set.description ?? null,
      permissions: set.permissions,
    })),
  );

/** Every action a role can hold: core's, and the installed plugins' (from their manifests). */
export const permissionCatalog = async (client: Db): Promise<PermissionInfo[]> => {
  const installed = await installedManifests(client);

  return [
    ...CORE_PERMISSIONS.map((permission) => ({
      action: permission.action,
      group: permission.group,
      label: permission.label,
      description: null,
      source: 'core',
      ownerOnly: 'ownerOnly' in permission && permission.ownerOnly,
    })),
    ...installed.flatMap((plugin) =>
      (plugin.manifest?.permissions ?? []).map((permission) => ({
        action: permission.action,
        group: permission.group ?? plugin.manifest?.title ?? plugin.name,
        label: permission.label,
        description: permission.description ?? null,
        source: plugin.name,
        ownerOnly: false,
      })),
    ),
  ];
};

/** What the member may do, spelled out (owners and `*`: every known action they may hold). */
export const effectivePermissions = async (client: Db, member: Parameters<typeof can>[0]) => {
  const catalog = await permissionCatalog(client);

  return catalog
    .filter((permission) => can(member, permission.action))
    .map((permission) => permission.action);
};

export const listRoles = async (client: Db) => ({
  data: await wholeList((limit) =>
    selectRoles(client)
      .orderBy(
        sql`case ${roles.key} when 'owner' then 0 when 'admin' then 1 when 'member' then 2 else 3 end`,
        roles.name,
      )
      .limit(limit),
  ),
});

const OWNER_ONLY = new Set(OWNER_ONLY_PERMISSIONS);

/**
 * A role's permissions must be known actions (or `*`), never owner-only, and
 * — so nobody hands out more than they have — all within the editor's own.
 */
const checkPermissions = async (client: Db, permissions: string[]) => {
  const me = caller('user');
  const known = new Set((await permissionCatalog(client)).map((permission) => permission.action));

  const unknown = permissions.filter((action) => action !== '*' && !known.has(action));

  if (unknown.length) {
    throw fail('UNKNOWN_PERMISSION', `Unknown permissions: ${unknown.join(', ')}`, {
      permissions: unknown,
    });
  }

  const ownerOnly = permissions.filter((action) => OWNER_ONLY.has(action));

  if (ownerOnly.length) {
    throw fail('OWNER_ONLY_PERMISSION', `Only owners can do: ${ownerOnly.join(', ')}`, {
      permissions: ownerOnly,
    });
  }

  const beyond = permissions.filter((action) => !can(me, action));

  if (beyond.length) {
    throw fail('BEYOND_OWN_PERMISSIONS', "A role can't hold permissions you don't have", {
      permissions: beyond,
    });
  }

  return [...new Set(permissions)].toSorted();
};

const noSuchRole = () => fail('ROLE_NOT_FOUND', 'No such role');

const roleOrThrow = async (client: Db, key: string) => {
  const [row] = await client.select().from(roles).where(eq(roles.key, key)).limit(1);

  if (!row) throw noSuchRole();

  return row;
};

/**
 * Assigning roles (invite, role change): each must exist, and hold nothing
 * beyond the assigner's own permissions (owners assign anything). One query
 * for all of them; the first role that fails, in `keys` order, is the error.
 */
export const assertAssignable = async (client: Db, keys: string | string[]) => {
  const me = caller('user');
  const wanted = [...new Set([keys].flat())];

  const rows = new Map(
    (await client.select().from(roles).where(inArray(roles.key, wanted))).map((row) => [
      row.key,
      row,
    ]),
  );

  for (const key of wanted) {
    const row = rows.get(key);

    if (!row) throw noSuchRole();

    const wider =
      me.role !== 'owner' &&
      (row.permissions.includes('*')
        ? !me.permissions.includes('*')
        : row.permissions.some((action) => !can(me, action)));

    if (wider) {
      throw fail(
        'BEYOND_OWN_PERMISSIONS',
        `You can't give the ${row.name} role: it can do more than you`,
      );
    }
  }
};

export const createRole = async (input: {
  name: string;
  description?: string | null;
  permissions: string[];
}) => {
  const tx = db();

  const permissions = await checkPermissions(tx, input.permissions);

  const row = oneRow(
    await tx
      .insert(roles)
      .values({
        key: `r_${newId()}`,
        name: input.name,
        description: input.description ?? null,
        permissions,
      })
      .returning(),
  );

  await recordAudit(tx, {
    action: 'role.created',
    targetType: 'role',
    targetId: row.key,
    targetLabel: row.name,
    metadata: { permissions },
  });

  return roleWithMembers(tx, row.key);
};

export const updateRole = async (
  key: string,
  input: { name?: string; description?: string | null; permissions?: string[] },
) => {
  const tx = db();

  if (FIXED.has(key)) {
    throw fail('FIXED_ROLE', 'Owner and Admin roles can’t be changed');
  }

  const before = await roleOrThrow(tx, key);

  const permissions = input.permissions ? await checkPermissions(tx, input.permissions) : undefined;

  const row = oneRow(
    await tx
      .update(roles)
      .set({
        name: input.name,
        description: input.description,
        permissions,
        updatedAt: sql`now()`,
      })
      .where(eq(roles.key, key))
      .returning(),
  );

  await recordAudit(tx, {
    action: 'role.updated',
    targetType: 'role',
    targetId: key,
    targetLabel: row.name,
    changes: {
      ...(input.name !== undefined && input.name !== before.name
        ? { name: [before.name, input.name] }
        : {}),
      ...(permissions ? { permissions: [before.permissions, permissions] } : {}),
    },
  });

  return roleWithMembers(tx, key);
};

export const removeRole = async (key: string) => {
  const tx = db();

  const row = await roleOrThrow(tx, key);

  if (row.builtin) throw fail('BUILTIN_ROLE', 'Built-in roles can’t be deleted');

  const [count] = await tx
    .select({ members: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, key));

  if (count?.members) {
    throw fail(
      'ROLE_IN_USE',
      `${count.members} members have this role: give them another one first`,
    );
  }

  await tx.delete(roles).where(eq(roles.key, key));
  await recordAudit(tx, {
    action: 'role.deleted',
    targetType: 'role',
    targetId: key,
    targetLabel: row.name,
  });

  return { ok: true as const };
};
