import { sql } from 'drizzle-orm';
import { type AnyPgColumn, pgTableCreator, text } from 'drizzle-orm/pg-core';

/**
 * Every core table is `core_<name>`: the database is shared with plugins
 * (`<plugin>_<name>`). Index and constraint names are global in the schema,
 * so they repeat the full prefixed table name.
 */
export const pgTable = pgTableCreator((name) => `core_${name}`);

/**
 * The organisation a row belongs to. An insert takes it from the scope
 * (`withOrg` sets `app.org_id`), so services never pass it, and row level
 * security checks it. A `withSystem` scope has no organisation: its inserts
 * name one, or fail on NOT NULL.
 */
export const orgIdColumn = () =>
  text()
    .notNull()
    .default(sql`nullif(current_setting('app.org_id', true), '')`);

/**
 * The units a record is in: at least one. An insert that names none puts it where its maker
 * sits: the calling member's units (an API key's own, when it is limited to some), which
 * `core_new_record_unit_ids()` reads from the scope as `orgIdColumn` does, so every way a
 * record is made follows it. A table with it also has `recordOwnerIdColumn()`,
 * `visibleToColumn()` and the `core_set_visible_to` trigger, which puts a record nobody placed
 * in the organisation's own unit and refuses a unit that doesn't exist.
 */
export const unitIdsColumn = () =>
  text()
    .array()
    .default(sql`core_new_record_unit_ids()`)
    .notNull();

/**
 * The team member responsible for a record. An insert that names none leaves it empty, except
 * for a member whose role reaches only their own records: what they make is theirs
 * (`core_new_record_owner_id()`).
 */
export const recordOwnerIdColumn = () => text().default(sql`core_new_record_owner_id()`);

/**
 * Whose reach holds a record, kept by the `core_set_visible_to` trigger from the row's owner
 * and units: `*` (the organisation), `o:<owner>`, `e:<unit>` for each of its units and
 * `u:<unit>` for those and every unit above them. Row level security shows the record when one
 * of them is among the caller's (`core_reach` policy, drizzle/0090_reach.sql), and a GIN index
 * on it finds a small unit's records in a large table. Never written by hand, never in the API.
 */
export const visibleToColumn = () =>
  text()
    .array()
    .default(sql`'{}'::text[]`)
    .notNull();

const literal = (value: string | number) =>
  typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;

/**
 * `column IN ('a', 'b')` for a CHECK, from the list in `./enums` the column's
 * `enum` uses. A constraint can't take parameters, so the values are inlined.
 */
export const inList = (column: AnyPgColumn, values: readonly (string | number)[]) =>
  sql`${column} IN (${sql.raw(values.map(literal).join(', '))})`;

/**
 * One of core's types in `values`, or a plugin's matching `pattern`: `PLUGIN_LIST_TYPE`
 * (`sales:deal`) or `PLUGIN_RECORD_TYPE` (`operation.task`).
 */
export const inListOrMatch = (column: AnyPgColumn, values: readonly string[], pattern: string) =>
  sql`${inList(column, values)} OR ${column} ~ ${sql.raw(literal(pattern))}`;
