import type { Db } from '@erxes/core-db';
import type {
  DATA_EXTENSION_ON_DELETE,
  DATA_EXTENSION_TABLE_KINDS,
} from '@erxes/core-db/dataExtensionEnums';
import { sql } from 'drizzle-orm';
import { fail, pgCode } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import type { FieldColumn } from './columns';

/**
 * Changes to an organisation's Data Extensions tables, through the `core_data_*` functions
 * (drizzle/0087_data_extensions.sql), in the request's transaction: with the definitions written
 * beside them, they are saved together or not at all. One after another, since inside a request
 * `client` is its transaction, a single connection.
 */

/** How long a change waits for a table another request is using. */
const LOCK_TIMEOUT = '8s';

/**
 * Runs `change` with the lock timeout set. A table still busy after it answers 409
 * SCHEMA_BUSY, and the whole request rolls back.
 */
export const changeSchema = async <T>(client: Db, change: () => Promise<T>) => {
  await client.execute(sql`select set_config('lock_timeout', ${LOCK_TIMEOUT}, true)`);

  try {
    return await change();
  } catch (error) {
    if (pgCode(error) === '55P03') {
      throw fail(
        'SCHEMA_BUSY',
        'Another change to the data model is using these records. Try again.',
      );
    }

    throw error;
  }
};

export const createTable = (
  client: Db,
  table: string,
  kind: (typeof DATA_EXTENSION_TABLE_KINDS)[number],
) => client.execute(sql`select core_data_create_table(${table}, ${kind})`);

export const dropTable = (client: Db, table: string) =>
  client.execute(sql`select core_data_drop_table(${table})`);

/** A field's columns; `indexed` adds an index on each (a relation's id column). */
export const addColumns = (client: Db, table: string, columns: FieldColumn[], indexed = false) =>
  inOrder(columns, (column) =>
    client.execute(
      sql`select core_data_add_column(${table}, ${column.name}, ${column.type}, ${indexed})`,
    ),
  );

export const dropColumns = (client: Db, table: string, columns: FieldColumn[]) =>
  inOrder(columns, (column) =>
    client.execute(sql`select core_data_drop_column(${table}, ${column.name})`),
  );

export const setUnique = (client: Db, table: string, column: string, unique: boolean) =>
  client.execute(sql`select core_data_set_unique(${table}, ${column}, ${unique})`);

/** A foreign key from `column` to a custom object's table. */
export const addReference = (
  client: Db,
  table: string,
  column: string,
  target: string,
  onDelete: (typeof DATA_EXTENSION_ON_DELETE)[number],
) =>
  client.execute(sql`select core_data_add_reference(${table}, ${column}, ${target}, ${onDelete})`);
