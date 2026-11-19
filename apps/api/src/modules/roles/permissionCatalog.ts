import {
  CORE_PERMISSIONS,
  type PermissionInfo,
  type PermissionSet,
  REACH_PERMISSIONS,
} from '@erxes/core-contract';
import { type Db, type RoleReach } from '@erxes/core-db';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { installedPlugins } from '~/modules/plugins/installedPlugin';

/** The installed plugins' ready-made bundles of their permissions. */
export const permissionSets = async (client: Db): Promise<PermissionSet[]> =>
  (await installedPlugins(client)).flatMap((plugin) =>
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
  const installed = await installedPlugins(client);

  return [
    ...CORE_PERMISSIONS.map((permission) => ({
      action: permission.action,
      group: permission.group,
      label: permission.label,
      description: null,
      source: 'core',
      ownerOnly: 'ownerOnly' in permission && permission.ownerOnly,
      followsReach: REACH_PERMISSIONS.includes(permission.action),
    })),
    ...installed.flatMap((plugin) =>
      (plugin.manifest?.permissions ?? []).map((permission) => ({
        action: permission.action,
        group: permission.group ?? plugin.manifest?.title ?? plugin.name,
        label: permission.label,
        description: permission.description ?? null,
        source: plugin.name,
        ownerOnly: false,
        followsReach: permission.followsReach ?? false,
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

/**
 * 400 WHOLE_ORGANIZATION_ONLY when a role that reaches less than the organisation holds `*`
 * or an action that doesn't follow its reach. Actions nobody declares now (a plugin that was
 * taken off) give nothing, so they pass.
 */
export const assertWithinReach = (
  catalog: PermissionInfo[],
  permissions: string[],
  reach: RoleReach,
) => {
  if (reach === 'organization') return;

  const acrossOrganization = new Set([
    '*',
    ...catalog
      .filter((permission) => !permission.followsReach)
      .map((permission) => permission.action),
  ]);

  const refused = permissions.filter((action) => acrossOrganization.has(action));

  if (refused.length) {
    throw fail(
      'WHOLE_ORGANIZATION_ONLY',
      `These work across the whole organisation, so a role that reaches less can't hold them: ${refused.join(', ')}`,
      { permissions: refused },
    );
  }
};
