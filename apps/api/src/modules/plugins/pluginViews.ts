import type { Db } from '@erxes/core-db';
import { RELATION_VIEW_KINDS } from '@erxes/core-db/enums';
import { textArray } from '@erxes/plugin-sdk/filter';
import { sql } from 'drizzle-orm';

/**
 * Views plugins keep for core to read (a relation's rows, an object's own fields): owned by
 * the plugin's role, in `public`, granted to core.
 */

/** A view's columns: their type category (`N` number, `D` date, `S` text, `B` yes/no, `A` array) and type name. */
export type ViewColumns = Map<string, { category: string; type: string }>;

export interface PluginView {
  plugin: string;
  view: string;
}

export const pluginViewKey = ({ plugin, view }: PluginView) => `${plugin}:${view}`;

const ROLE_PREFIX = 'erxes_plugin_';

/**
 * The columns of each view, by `pluginViewKey`, where the plugin's own role owns the view (so a
 * manifest can't name core's tables or another plugin's) and core may read it. A view that
 * isn't so has no columns.
 */
export const pluginViewColumns = async (
  client: Db,
  views: PluginView[],
): Promise<Map<string, ViewColumns>> => {
  const owned = views.map(({ plugin, view }) => `${ROLE_PREFIX}${plugin}:${view}`);

  const { rows } = await client.execute<{
    key: string;
    name: string;
    category: string;
    type: string;
  }>(sql`
    select substr(r.rolname, ${ROLE_PREFIX.length + 1}) || ':' || c.relname as key,
      a.attname as name, t.typcategory as category, t.typname as type
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    join pg_roles r on r.oid = c.relowner
    join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
    join pg_type t on t.oid = a.atttypid
    where c.relkind::text = any(${textArray([...RELATION_VIEW_KINDS])})
      and has_table_privilege(c.oid, 'SELECT')
      and r.rolname || ':' || c.relname = any(${textArray(owned)})`);

  const columns = new Map<string, ViewColumns>(
    views.map((view) => [pluginViewKey(view), new Map()]),
  );

  for (const row of rows) {
    columns.get(row.key)?.set(row.name, { category: row.category, type: row.type });
  }

  return columns;
};

const CATEGORY: Record<string, string> = {
  number: 'N',
  date: 'D',
  boolean: 'B',
  text: 'S',
  select: 'S',
  member: 'S',
  product: 'S',
};

/** Whether a view's column holds what a field says: `amount` a number, `stage` text. */
export const columnFits = (
  column: { category: string; type: string } | undefined,
  field: { type: string; array?: boolean },
) =>
  !!column &&
  (field.array
    ? column.category === 'A' && column.type === '_text'
    : column.category === CATEGORY[field.type]);
