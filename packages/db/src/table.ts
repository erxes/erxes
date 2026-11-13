import { sql } from 'drizzle-orm';
import { type AnyPgColumn, pgTableCreator } from 'drizzle-orm/pg-core';

/**
 * Every core table is `core_<name>`: the database is shared with plugins
 * (`<plugin>_<name>`). Index and constraint names are global in the schema,
 * so they repeat the full prefixed table name.
 */
export const pgTable = pgTableCreator((name) => `core_${name}`);

const literal = (value: string | number) =>
  typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;

/**
 * `column IN ('a', 'b')` for a CHECK, from the list in `./enums` the column's
 * `enum` uses. A constraint can't take parameters, so the values are inlined.
 */
export const inList = (column: AnyPgColumn, values: readonly (string | number)[]) =>
  sql`${column} IN (${sql.raw(values.map(literal).join(', '))})`;
