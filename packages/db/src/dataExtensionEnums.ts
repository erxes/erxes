/** Data Extensions' value lists, kept as `./enums` is: one `as const` array each, no imports. */

/**
 * What a field holds. Each is one column of the record's table, or several for `currency`,
 * `fullName`, `address`, `emails`, `phones` and `links`.
 */
export const DATA_EXTENSION_FIELD_TYPES = [
  'text',
  'longText',
  'number',
  'percent',
  'currency',
  'rating',
  'boolean',
  'date',
  'dateTime',
  'select',
  'multiSelect',
  'email',
  'phone',
  'url',
  'emails',
  'phones',
  'links',
  'fullName',
  'address',
  'member',
  'files',
  'relation',
  'json',
] as const;

/** Colours of a select field's options; web maps each to a theme token. */
export const DATA_EXTENSION_OPTION_COLORS = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
] as const;

/**
 * How many records each side of a relation links. The "many" side of `manyToOne` and
 * `oneToMany` holds the link; `manyToMany` keeps a table of pairs.
 */
export const DATA_EXTENSION_RELATION_KINDS = [
  'manyToOne',
  'oneToMany',
  'oneToOne',
  'manyToMany',
] as const;

/** A relation's two fields: the one created first, and its pair on the target record type. */
export const DATA_EXTENSION_RELATION_SIDES = ['source', 'inverse'] as const;

/** What happens to a link when the linked custom record is deleted for good. */
export const DATA_EXTENSION_ON_DELETE = ['setNull', 'cascade'] as const;

/** How a field's `visibleWhen` compares another field's value. */
export const DATA_EXTENSION_VISIBLE_OPERATORS = ['eq', 'neq', 'in', 'isNotEmpty'] as const;

/** A custom object's own columns its records can be sorted by, besides its fields. */
export const DATA_EXTENSION_SORT_COLUMNS = ['createdAt', 'updatedAt', 'position'] as const;

/** An object or field: archived ones keep their data and hide from screens. */
export const DATA_EXTENSION_STATUSES = ['active', 'archived'] as const;

/**
 * The tables Data Extensions keeps in an organisation's schema: a custom object's records
 * (`obj_<key>`), a core or plugin record type's values (`ext_<plugin>_<type>`), and a
 * many-to-many relation's pairs (`rel_<field id>`).
 */
export const DATA_EXTENSION_TABLE_KINDS = ['object', 'host', 'pairs'] as const;

/** The Postgres types a field's columns take. */
export const DATA_EXTENSION_COLUMN_TYPES = [
  'text',
  'text[]',
  'numeric',
  'smallint',
  'boolean',
  'date',
  'timestamptz',
  'jsonb',
] as const;
