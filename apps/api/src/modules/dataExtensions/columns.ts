import { sha256 } from '~/lib/crypto';
import type {
  DATA_EXTENSION_COLUMN_TYPES,
  DATA_EXTENSION_FIELD_TYPES,
} from '@erxes/core-db/dataExtensionEnums';
import type { DataFieldRelation, DataFieldSettings } from '@erxes/core-db';

/**
 * Where Data Extensions keeps things in an organisation's schema. The `core_data_*` functions
 * (drizzle/0095_data_extensions.sql) accept these names, so the rules here and there agree.
 */

type ColumnType = (typeof DATA_EXTENSION_COLUMN_TYPES)[number];

type FieldType = (typeof DATA_EXTENSION_FIELD_TYPES)[number];

/** An organisation's schema, as `core_data_scope_schema()` names it. */
export const schemaOf = (orgId: string) => `data_${orgId}`;

/** Longest table name the functions take (index names add a suffix). */
const TABLE_MAX = 48;

/** Longest column prefix: a composite's parts add at most 12 characters (`_postal_code`). */
const COLUMN_MAX = 48;

/** The columns the tables come with, which `core_data_check_column` refuses for a field. */
const SYSTEM_COLUMNS: ReadonlySet<string> = new Set([
  'id',
  'org_id',
  'position',
  'search',
  'created_by',
  'updated_by',
  'created_at',
  'updated_at',
  'deleted_at',
  'record_id',
  'source_id',
  'target_id',
]);

/** A key in snake case: `dueDate` → `due_date`. */
export const snake = (name: string) =>
  name
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replaceAll(/[^a-z0-9_]/g, '_');

/**
 * A new field's column: its key in snake case (`dueDate` → `due_date`), cut to fit, with a
 * number when the record type has that column already. A field keeps its column when its key
 * changes, so the column's indexes keep their names.
 */
export const freeColumn = (key: string, taken: ReadonlySet<string>) => {
  const base = snake(key).slice(0, COLUMN_MAX - 3);

  const free = (n: number): string => {
    const name = n === 1 ? base : `${base}_${n}`;

    return taken.has(name) || SYSTEM_COLUMNS.has(name) || SYSTEM_COLUMNS.has(linkColumn(name))
      ? free(n + 1)
      : name;
  };

  return free(1);
};

/** A custom object's table: `obj_<key>`. */
export const objectTable = (key: string) => `obj_${key}`.slice(0, TABLE_MAX);

/** A core or plugin record type's table: `ext_<plugin>_<type>`, a suffix when that's taken. */
export const hostTable = (recordType: string, suffix = '') =>
  `ext_${snake(recordType.replace('.', '_'))}`.slice(0, TABLE_MAX - suffix.length) + suffix;

/** A many-to-many relation's pairs: `rel_p<source field id>`. */
export const pairsTable = (fieldId: string) =>
  `rel_p${fieldId.toLowerCase().replaceAll(/[^a-z0-9]/g, '')}`.slice(0, TABLE_MAX);

/** The name `core_data_set_unique` gives a unique column's index (`core_data_suffix`). */
export const uniqueIndexOf = (table: string, column: string) =>
  `${table}_${sha256(column).slice(0, 8)}_key`;

/** One column a field keeps: `part` names it within a composite value (`amount`). */
export interface FieldColumn {
  part: string | null;
  name: string;
  type: ColumnType;
}

const one = (column: string, type: ColumnType): FieldColumn[] => [
  { part: null, name: column, type },
];

const parts = (column: string, list: [part: string, suffix: string, type: ColumnType][]) =>
  list.map(([part, suffix, type]) => ({ part, name: `${column}_${suffix}`, type }));

const SCALAR: Partial<Record<FieldType, ColumnType>> = {
  text: 'text',
  longText: 'text',
  email: 'text',
  phone: 'text',
  url: 'text',
  select: 'text',
  number: 'numeric',
  percent: 'numeric',
  rating: 'smallint',
  boolean: 'boolean',
  date: 'date',
  dateTime: 'timestamptz',
  multiSelect: 'text[]',
  files: 'jsonb',
  json: 'jsonb',
  autoNumber: 'bigint',
};

/** Types computed as records are read: they keep no column. */
export const isComputed = (type: FieldType) => type === 'formula' || type === 'rollup';

const COMPOSITE: Partial<Record<FieldType, [string, string, ColumnType][]>> = {
  currency: [
    ['amount', 'amount', 'numeric'],
    ['currency', 'currency', 'text'],
  ],
  fullName: [
    ['firstName', 'first_name', 'text'],
    ['lastName', 'last_name', 'text'],
  ],
  address: [
    ['street', 'street', 'text'],
    ['street2', 'street2', 'text'],
    ['city', 'city', 'text'],
    ['state', 'state', 'text'],
    ['postalCode', 'postal_code', 'text'],
    ['country', 'country', 'text'],
    ['lat', 'lat', 'numeric'],
    ['lng', 'lng', 'numeric'],
  ],
  emails: [
    ['primary', 'primary', 'text'],
    ['additional', 'additional', 'jsonb'],
  ],
  phones: [
    ['primary', 'primary', 'text'],
    ['additional', 'additional', 'jsonb'],
  ],
  links: [
    ['primary', 'primary', 'jsonb'],
    ['additional', 'additional', 'jsonb'],
  ],
};

/**
 * Whether this side of a relation keeps the link in its own table: the "many" side of a
 * many-to-one (its source, or a one-to-many's inverse) and a one-to-one's source. The other
 * side reads it from there; a many-to-many keeps pairs in their own table.
 */
export const holdsLink = ({ kind, side }: Pick<DataFieldRelation, 'kind' | 'side'>) =>
  (kind === 'manyToOne' && side === 'source') ||
  (kind === 'oneToMany' && side === 'inverse') ||
  (kind === 'oneToOne' && side === 'source');

/** A relation side's id column: `<column>_id`. */
export const linkColumn = (column: string) => `${column}_id`;

/** The columns a field keeps in its record type's table, for `column` as its name or prefix. */
export const columnsOf = (field: {
  type: FieldType;
  column: string | null;
  relation: DataFieldRelation | null;
  settings: DataFieldSettings;
}): FieldColumn[] => {
  const { type, column, relation, settings } = field;

  if (!column || isComputed(type)) return [];

  if (type === 'relation') {
    return relation && holdsLink(relation) ? one(linkColumn(column), 'text') : [];
  }

  if (type === 'member') return one(column, settings.multiple ? 'text[]' : 'text');

  const scalar = SCALAR[type];

  if (scalar) return one(column, scalar);

  return parts(column, COMPOSITE[type] ?? []);
};
