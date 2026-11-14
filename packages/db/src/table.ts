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

const literal = (value: string | number) =>
  typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;

/**
 * `column IN ('a', 'b')` for a CHECK, from the list in `./enums` the column's
 * `enum` uses. A constraint can't take parameters, so the values are inlined.
 */
export const inList = (column: AnyPgColumn, values: readonly (string | number)[]) =>
  sql`${column} IN (${sql.raw(values.map(literal).join(', '))})`;
