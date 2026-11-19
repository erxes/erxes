import {
  type Db,
  orgUnitTypes,
  pluginInstallations,
  type StoredPluginManifest,
} from '@erxes/core-db';
import { sql } from 'drizzle-orm';

type DeclaredType = NonNullable<StoredPluginManifest['unitTypes']>[number];

const PLUGIN_ORDER = 10_000;

const declaredRows = (declared: DeclaredType[]) =>
  sql`jsonb_to_recordset(${JSON.stringify(
    declared.map((type, order) => ({
      code: type.code,
      name: type.name,
      description: type.description ?? null,
      color: type.color ?? '#64748b',
      icon: type.icon ?? null,
      can_be_root: type.canBeRoot ?? true,
      parents: type.parents ?? [],
      order: PLUGIN_ORDER + order,
    })),
  )}::jsonb) as d(code text, name text, description text, color text, icon text, can_be_root boolean, parents text[], "order" int)`;

export const syncPluginUnitTypes = async (
  tx: Db,
  plugin: string,
  declared: DeclaredType[] = [],
) => {
  const d = declaredRows(declared);

  if (declared.length) {
    await tx.execute(sql`insert into ${orgUnitTypes}
        (id, org_id, plugin, code, name, description, color, icon, can_be_root, sort_order)
      select substr(md5(random()::text || i.org_id || d.code), 1, 17),
        i.org_id, ${plugin}, d.code, d.name, d.description, d.color, d.icon, d.can_be_root, d."order"
      from ${pluginInstallations} i cross join ${d}
      where i.plugin = ${plugin}
      on conflict (org_id, plugin, code) where plugin is not null do update
        set name = excluded.name, description = excluded.description, color = excluded.color,
          icon = excluded.icon, can_be_root = excluded.can_be_root, sort_order = excluded.sort_order,
          is_active = true, updated_at = now()
        where (${orgUnitTypes}.name, ${orgUnitTypes}.description, ${orgUnitTypes}.color, ${orgUnitTypes}.icon, ${orgUnitTypes}.can_be_root, ${orgUnitTypes}.sort_order, ${orgUnitTypes}.is_active)
          is distinct from (excluded.name, excluded.description, excluded.color, excluded.icon, excluded.can_be_root, excluded.sort_order, true)`);

    await tx.execute(sql`update ${orgUnitTypes} t
      set allowed_parent_type_ids = wanted.ids, updated_at = now()
      from ${d}
      cross join lateral (
        select coalesce(array_agg(p.id order by p.code) filter (where p.id is not null), '{}'::text[]) as ids,
          p_org.org_id
        from (select distinct org_id from ${orgUnitTypes} where plugin = ${plugin}) p_org
        left join ${orgUnitTypes} p
          on p.org_id = p_org.org_id and p.plugin = ${plugin} and p.code = any(d.parents)
        group by p_org.org_id
      ) wanted
      where t.plugin = ${plugin} and t.code = d.code and t.org_id = wanted.org_id
        and t.allowed_parent_type_ids is distinct from wanted.ids`);
  }

  await tx.execute(sql`update ${orgUnitTypes} t set is_active = false, updated_at = now()
    where t.plugin = ${plugin} and t.is_active
      and not exists (select 1 from ${d} where d.code = t.code)`);
};
