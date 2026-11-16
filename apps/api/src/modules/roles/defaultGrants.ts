import { type Db, pluginInstallations, roles, type StoredPluginManifest } from '@erxes/core-db';
import { sql } from 'drizzle-orm';

type PermissionSets = StoredPluginManifest['permissionSets'];

/** Each built-in role the sets name in `defaultRoles`, with their permissions. */
const grantsOf = (sets: PermissionSets = []) => {
  const grants = new Map<string, Set<string>>();

  for (const set of sets)
    for (const role of set.defaultRoles ?? [])
      grants.set(role, new Set([...(grants.get(role) ?? []), ...set.permissions]));

  return grants;
};

/**
 * Gives built-in roles the permissions of the plugin's sets that name them (`defaultRoles`), in
 * every organisation the scope sees that has the plugin installed (one inside `withOrg`). With
 * `before`, the sets the manifest had, only what they didn't give yet: a permission an owner
 * took out of the role stays out.
 */
export const grantDefaultPermissions = async (
  tx: Db,
  plugin: string,
  sets: PermissionSets,
  before?: PermissionSets,
) => {
  const given = grantsOf(before);

  const grants = [...grantsOf(sets)].flatMap(([role, actions]) => {
    const added = [...actions].filter((action) => !given.get(role)?.has(action));

    return added.length ? [{ role, added }] : [];
  });

  if (!grants.length) return;

  await tx.execute(sql`update ${roles} r
    set permissions = (select array_agg(distinct p order by p) from unnest(r.permissions || g.added) p),
      updated_at = now()
    from jsonb_to_recordset(${JSON.stringify(grants)}::jsonb) as g(role text, added text[])
    where r.key = g.role and not r.permissions @> g.added
      and exists (select 1 from ${pluginInstallations} i
        where i.org_id = r.org_id and i.plugin = ${plugin} and i.status = 'active')`);
};
