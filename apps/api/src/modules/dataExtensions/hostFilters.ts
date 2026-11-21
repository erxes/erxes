import { type Db, plugins } from '@erxes/core-db';
import type { FilterColumn } from '@erxes/plugin-sdk/filter';
import { inArray, type SQL, sql } from 'drizzle-orm';
import { computedFor } from './computed';
import { alias, type DataFieldRow, fieldsOf, qualified, tableOf } from './definitions';
import { readableFields } from './fieldAccess';
import { filterFields, sortExpression } from './recordQueries';
import { relationSides } from './relationValues';

/**
 * A core record type's Data Extensions fields as SQL over a row of core's own table: what its
 * lists, saved views and automations filter and sort by. Each value is read from the record
 * type's table (`ext_core_<type>`) by the record's id, with DE's own filter and sort code.
 */

const X = alias('x');
const IDS = alias('ids');

/** The prefix of a Data Extensions field's path: `subject.data.<key>` filters, `data.<key>` sorts. */
export const DATA_PATH = 'data.';

/** A field a list filters by, with what the filter picker shows of it. */
export interface DataFilterSpec extends FilterColumn {
  path: string;
  label: string;
  expr: SQL;
  field: DataFieldRow;
  options?: string[];
  /** The plugin's title, for a field a plugin declared. */
  pluginTitle?: string;
}

const pluginTitles = async (client: Db, fields: DataFieldRow[]) => {
  const names = [...new Set(fields.flatMap((field) => (field.plugin ? [field.plugin] : [])))];

  if (!names.length) return new Map<string, string>();

  const rows = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .where(inArray(plugins.name, names));

  return new Map(rows.map((row) => [row.name, row.manifest?.title ?? row.name]));
};

/**
 * The record type's fields the caller may read, as filters (`subject.data.<key>`, the
 * filterable ones) and sort expressions, over the row `recordId` names (`core_customers.id`).
 * Null when the record type has no fields.
 */
export const hostListSource = async (client: Db, recordType: string, recordId: SQL) => {
  const all = await fieldsOf(client, recordType);

  if (!all.length) return null;

  const table = await tableOf(client, recordType);
  const sides = await relationSides(client, all);
  const id = sql`${IDS}.id`;
  const computed = await computedFor(client, recordType, all, X, id);
  const readable = await readableFields(client, all, computed.uses);
  const titles = await pluginTitles(client, readable);
  const ext = table ? qualified(table) : sql`(select null::text as record_id)`;
  const from = sql`(select ${recordId} as id) ${IDS} left join ${ext} ${X} on ${X}.record_id = ${IDS}.id${computed.join}`;
  const over = (expr: SQL | FilterColumn['expr']) => sql`(select ${expr} from ${from})`;
  const columns = filterFields(readable, sides, X, id, computed.values);

  const filters = readable.flatMap((field): DataFilterSpec[] => {
    const column = columns[`subject.${field.key}`];

    if (!column || field.settings.filterable === false) return [];

    return [
      {
        ...column,
        path: `subject.${DATA_PATH}${field.key}`,
        label: field.label,
        expr: over(column.expr),
        field,
        options: field.options.length ? field.options.map((option) => option.value) : undefined,
        pluginTitle: field.plugin ? (titles.get(field.plugin) ?? field.plugin) : undefined,
      },
    ];
  });

  return {
    filters,
    /** A sort path's expression (`data.<key>`), or null for one the caller can't sort by. */
    sortBy: (path: string) => {
      const key = path.startsWith(DATA_PATH) ? path.slice(DATA_PATH.length) : null;
      const field = readable.find((one) => one.key === key);
      const expr = field ? sortExpression(readable, X, field.key, computed.values) : null;

      return expr ? over(expr) : null;
    },
  };
};
