import type { ConditionGroup, ConditionRule } from '@erxes/core-contract';
import { companies, customers, type Db } from '@erxes/core-db';
import {
  compileColumn,
  compileFilter,
  type FilterColumn,
  type FilterContext,
  type FilterFields,
  invalidFilter,
} from '@erxes/plugin-sdk/filter';
import { type SQL, sql } from 'drizzle-orm';
import {
  columnFits,
  pluginViewColumns,
  pluginViewKey,
  type ViewColumns,
} from '~/modules/plugins/pluginViews';
import type { FieldSpec, RelatedSpec } from './fieldSpec';

/** The relations' views, by plugin and view name. */
export type RelationViews = Map<string, ViewColumns>;

const viewKey = ({ plugin, relation }: RelatedSpec) =>
  pluginViewKey({ plugin, view: relation.view });

/** A relation's view is the plugin's and has `record_id` and its fields' columns, or the filter is refused. */
const checkView = (spec: RelatedSpec, columns: ViewColumns) => {
  const { relation } = spec;

  if (!columns.size) throw invalidFilter(`${relation.label} can't be filtered by yet`);

  if (columns.get('record_id')?.category !== 'S')
    throw invalidFilter(`${relation.label}: the plugin's view has no record_id`);

  const wrong = relation.fields.find((field) => !columnFits(columns.get(field.key), field));

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

  const views = await pluginViewColumns(
    client,
    [...related.values()].map(({ plugin, relation }) => ({ plugin, view: relation.view })),
  );

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
