import { DataExtensionValues } from '@erxes/core-contract';
import type { DataResultType } from '@erxes/core-db';
import type { FilterColumn, FilterFields } from '@erxes/plugin-sdk/filter';
import { type SQL, sql } from 'drizzle-orm';
import { readColumn, valueFromRow } from './codec';
import { columnsOf, isComputed } from './columns';
import type { DataFieldRow } from './definitions';
import { autoNumberText, outputOf } from './formula/fieldValue';
import { readRelation, type RelationSide } from './relationValues';

/** How a record type's values are read: its columns and relations as select expressions. */

/** The alias a relation value is read under. */
const relationAlias = (field: DataFieldRow) => `rel:${field.id}`;

/** The alias a formula's or rollup's value is read under. */
const computedAlias = (field: DataFieldRow) => `cmp:${field.id}`;

/** A formula or rollup field's value over the record: its SQL and type. */
export type ComputedValues = Map<string, { sql: SQL; type: DataResultType }>;

/**
 * The select list of a record type's values: each stored column under its own name, each
 * relation kept elsewhere under `rel:<field id>`, each computed value under `cmp:<field id>`.
 * `table` is the record's table's alias and `recordId` the record's id.
 */
export const valueColumns = (
  fields: DataFieldRow[],
  sides: Map<string, RelationSide>,
  table: SQL,
  recordId: SQL,
  computed: ComputedValues,
): SQL[] =>
  fields.flatMap((field) => {
    const side = sides.get(field.id);
    const value = computed.get(field.id);

    if (value) return [sql`${outputOf(value)} as ${sql.identifier(computedAlias(field))}`];

    if (field.type === 'autoNumber' && field.column) {
      const number = sql`${table}.${sql.identifier(field.column)}`;

      return [sql`${autoNumberText(field, number)} as ${sql.identifier(field.column)}`];
    }

    if (side && !side.holds) {
      return [
        sql`${readRelation(side, table, recordId)} as ${sql.identifier(relationAlias(field))}`,
      ];
    }

    if (side) {
      // The link column, read through the relation so a recycled record isn't linked.
      return columnsOf(field).map(
        (column) => sql`${readRelation(side, table, recordId)} as ${sql.identifier(column.name)}`,
      );
    }

    return columnsOf(field).map(
      (column) => sql`${readColumn(table, column)} as ${sql.identifier(column.name)}`,
    );
  });

/** One field's value from a row read with `valueColumns`. */
const readValue = (
  field: DataFieldRow,
  side: RelationSide | undefined,
  row: Record<string, unknown>,
) => {
  if (isComputed(field.type)) return row[computedAlias(field)] ?? null;

  if (side && !side.holds) return row[relationAlias(field)] ?? null;

  return valueFromRow(field, row);
};

/** A row read with `valueColumns` as values by field key. */
export const valuesOf = (
  fields: DataFieldRow[],
  sides: Map<string, RelationSide>,
  row: Record<string, unknown>,
) =>
  // Typed as the JSON the contract sends: each value came from a column of a JSON-ready type.
  DataExtensionValues.parse(
    Object.fromEntries(
      fields.map((field) => {
        const side = sides.get(field.id);

        return [field.key, readValue(field, side, row)];
      }),
    ),
  );

const column = (table: SQL, name: string) => sql`${table}.${sql.identifier(name)}`;

/** Core's record types a filter compares ids of. */
const ID_FILTER_TYPES: Record<string, FilterColumn['type']> = {
  'core.customer': 'customer',
  'core.company': 'company',
  'core.product': 'product',
  'core.member': 'member',
};

/** How a list filters by one field, or null for a field lists don't filter by. */
const filterColumn = (
  field: DataFieldRow,
  side: RelationSide | undefined,
  table: SQL,
  recordId: SQL,
): FilterColumn | null => {
  const at = (suffix = '') => column(table, `${field.column ?? ''}${suffix}`);
  const label = field.label;

  switch (field.type) {
    case 'text':
    case 'longText':
    case 'email':
    case 'phone':
    case 'url':
      return { type: 'text', expr: at(), label };
    case 'emails':
    case 'phones':
      return { type: 'text', expr: at('_primary'), label };
    case 'fullName':
      return {
        type: 'text',
        expr: sql`nullif(concat_ws(' ', ${at('_first_name')}, ${at('_last_name')}), '')`,
        label,
      };
    case 'number':
    case 'percent':
    case 'rating':
    case 'autoNumber':
      return { type: 'number', expr: at(), label };
    case 'currency':
      return { type: 'number', expr: at('_amount'), label };
    case 'boolean':
      return { type: 'boolean', expr: at(), label };
    case 'date':
      return { type: 'date', expr: at(), label, dateOnly: true };
    case 'dateTime':
      return { type: 'date', expr: at(), label };
    case 'select':
      return { type: 'select', expr: at(), label };
    case 'multiSelect':
      return { type: 'select', expr: at(), label, array: true };
    case 'member':
      return { type: 'member', expr: at(), label, array: field.settings.multiple === true };
    case 'relation': {
      const type = side && ID_FILTER_TYPES[side.relation.targetRecordType];

      return side && type
        ? { type, expr: readRelation(side, table, recordId), label, array: side.many }
        : null;
    }

    default:
      return null;
  }
};

/** How a list filters by a formula's or rollup's value: as the type it gives. */
const computedFilter = (
  field: DataFieldRow,
  { sql: expr, type }: { sql: SQL; type: DataResultType },
): FilterColumn => {
  const label = field.label;

  switch (type) {
    case 'number':
      return { type: 'number', expr, label };
    case 'boolean':
      return { type: 'boolean', expr, label };
    case 'date':
      return { type: 'date', expr, label, dateOnly: true };
    case 'dateTime':
      return { type: 'date', expr, label };
    case 'text':
      return { type: 'text', expr, label };
  }
};

/** The paths (`subject.<key>`) a record list filters by: its fields, and when records changed. */
export const filterFields = (
  fields: DataFieldRow[],
  sides: Map<string, RelationSide>,
  table: SQL,
  recordId: SQL,
  computed: ComputedValues,
): FilterFields => ({
  'subject.createdAt': { type: 'date', expr: column(table, 'created_at'), label: 'Created' },
  'subject.updatedAt': { type: 'date', expr: column(table, 'updated_at'), label: 'Updated' },
  'subject.createdBy': { type: 'member', expr: column(table, 'created_by'), label: 'Created by' },
  ...Object.fromEntries(
    fields.flatMap((field) => {
      const value = computed.get(field.id);

      const filter = value
        ? computedFilter(field, value)
        : filterColumn(field, sides.get(field.id), table, recordId);

      return filter ? [[`subject.${field.key}`, filter]] : [];
    }),
  ),
});

const SYSTEM_SORT = new Map([
  ['createdAt', 'created_at'],
  ['updatedAt', 'updated_at'],
  ['position', 'position'],
]);

/**
 * The expression a list sorts by: a field's first column or computed value, or when records
 * were made.
 */
export const sortExpression = (
  fields: DataFieldRow[],
  table: SQL,
  sortField: string,
  computed: ComputedValues,
) => {
  const system = SYSTEM_SORT.get(sortField);

  if (system) return column(table, system);

  const field = fields.find((row) => row.key === sortField && row.type !== 'relation');
  const value = field && computed.get(field.id);

  if (value) return value.sql;
  const [first] = field ? columnsOf(field) : [];

  return first ? readColumn(table, first) : null;
};
