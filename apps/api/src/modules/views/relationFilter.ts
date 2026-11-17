import type { ConditionGroup, ConditionRule } from '@erxes/core-contract';
import { companies, customers, type Db } from '@erxes/core-db';
import { RELATION_VIEW_KINDS } from '@erxes/core-db/enums';
import {
  compileColumn,
  compileFilter,
  type FilterColumn,
  type FilterContext,
  type FilterFields,
  invalidFilter,
  textArray,
} from '@erxes/plugin-sdk/filter';
import { type SQL, sql } from 'drizzle-orm';
import type { FieldSpec, RelatedSpec, RelationField } from './fieldSpec';

/** A view's columns: their type category (`N` number, `D` date, `S` text, `B` yes/no, `A` array) and name. */
type ViewColumns = Map<string, { category: string; type: string }>;

/** The relations' views, by plugin and view name. */
export type RelationViews = Map<string, ViewColumns>;

const viewKey = ({ plugin, relation }: RelatedSpec) => `${plugin}:${relation.view}`;

const CATEGORY: Record<RelationField['type'], string> = {
  number: 'N',
  date: 'D',
  boolean: 'B',
  text: 'S',
  select: 'S',
  member: 'S',
  product: 'S',
};

const ROLE_PREFIX = 'erxes_plugin_';

/**
 * The columns of each relation's view, by `viewKey`, where the plugin's own role owns the view,
 * so a manifest can't name core's tables (or another plugin's), and has granted it to core.
 */
const viewColumns = async (client: Db, related: RelatedSpec[]): Promise<RelationViews> => {
  const owned = related.map(({ plugin, relation }) => `${ROLE_PREFIX}${plugin}:${relation.view}`);

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

  const views: RelationViews = new Map(related.map((spec) => [viewKey(spec), new Map()]));

  for (const row of rows) {
    views.get(row.key)?.set(row.name, { category: row.category, type: row.type });
  }

  return views;
};

/** Whether a view's column holds what the field says: `amount` a number, `stage` text. */
const fits = (column: { category: string; type: string } | undefined, field: RelationField) =>
  !!column &&
  (field.array
    ? column.category === 'A' && column.type === '_text'
    : column.category === CATEGORY[field.type]);

/** A relation's view is the plugin's and has `record_id` and its fields' columns, or the filter is refused. */
const checkView = (spec: RelatedSpec, columns: ViewColumns) => {
  const { relation } = spec;

  if (!columns.size) throw invalidFilter(`${relation.label} can't be filtered by yet`);

  if (columns.get('record_id')?.category !== 'S')
    throw invalidFilter(`${relation.label}: the plugin's view has no record_id`);

  const wrong = relation.fields.find((field) => !fits(columns.get(field.key), field));

  if (wrong)
    throw invalidFilter(
      `${relation.label}: the plugin's view has no ${wrong.type} column ${wrong.key}`,
    );
};

const rulesOf = (group: ConditionGroup): ConditionRule[] =>
  group.rules.flatMap((rule) => ('match' in rule ? rulesOf(rule) : [rule]));

/** The views a filter's relation rules read, each checked once. */
export const relationViews = async (
  client: Db,
  specs: Map<string, FieldSpec>,
  group: ConditionGroup,
): Promise<RelationViews> => {
  const related = new Map(
    rulesOf(group).flatMap((rule) => {
      const spec = specs.get(rule.path)?.related;

      return spec ? [[viewKey(spec), spec] as const] : [];
    }),
  );

  if (!related.size) return new Map();

  const views = await viewColumns(client, [...related.values()]);

  for (const [key, spec] of related) checkView(spec, views.get(key) ?? new Map());

  return views;
};

/**
 * A rule on a measure of related records ("Deals: count ≥ 3 where stage is Won"), as a
 * semi-join on the plugin's view: records whose related rows, grouped, meet it — and, when no
 * rows meet it too ("fewer than 3", "total under 100"), records with none.
 */
export const compileRelated = (
  spec: FieldSpec & { related: RelatedSpec },
  rule: ConditionRule,
  { company, views, context }: { company: boolean; views: RelationViews; context: FilterContext },
): SQL => {
  const { related } = spec;
  const columns = views.get(viewKey(related));
  const view = sql.identifier(related.relation.view);
  const column = (key: string) => sql`${view}.${sql.identifier(key)}`;
  const recordId = company ? companies.id : customers.id;

  const fields: FilterFields = Object.fromEntries(
    related.relation.fields.map((field): [string, FilterColumn] => [
      `subject.${field.key}`,
      {
        type: field.type,
        expr: column(field.key),
        label: field.label,
        array: field.array,
        dateOnly: columns?.get(field.key)?.type === 'date',
      },
    ]),
  );

  if (rule.where && rulesOf(rule.where).some((inner) => inner.where))
    throw invalidFilter(`${related.relation.label}: a rule inside "where" has no "where"`);

  const where = rule.where ? compileFilter(fields, rule.where, context) : undefined;
  const rows = sql`from ${view} where ${column('record_id')} is not null${where ? sql` and ${where}` : sql``}`;
  const has = sql`${recordId} in (select ${column('record_id')} ${rows})`;

  if (rule.op === 'exists') return has;

  if (rule.op === 'not_exists') return sql`not (${has})`;

  const { measure, field } = related;
  const dateOnly = !!field && columns?.get(field.key)?.type === 'date';
  const date = field?.type === 'date';

  const value = (expr: SQL) =>
    compileColumn(
      { type: date ? 'date' : 'number', expr, label: spec.label, dateOnly },
      spec.path,
      rule,
      context,
    );

  const measured = !field
    ? sql`count(*)::numeric`
    : measure === 'sum'
      ? sql`coalesce(sum(${column(field.key)}), 0)::numeric`
      : date
        ? sql`${sql.raw(measure)}(${column(field.key)})`
        : sql`${sql.raw(measure)}(${column(field.key)})::numeric`;

  // What a record without related rows measures: no rows count 0 and total 0, the rest nothing.
  const none =
    measure === 'count' || measure === 'sum'
      ? sql`0::numeric`
      : date
        ? sql.raw(dateOnly ? 'null::date' : 'null::timestamptz')
        : sql`null::numeric`;

  const grouped = sql`${recordId} in (select ${column('record_id')} ${rows} group by ${column('record_id')} having ${value(measured)})`;

  return sql`(${grouped} or (${value(none)} and not (${has})))`;
};
