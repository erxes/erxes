import { type Db, dataFields, dataTables } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { columnsOf } from './columns';
import { dropColumns, dropTable } from './ddl';
import { type DataFieldRow, tableOf } from './definitions';

/** Where a field's values go when it is dropped. Callers run these in `changeSchema`. */

/** The relation fields that link to `recordType`, on any record type, itself included. */
export const relationsTo = (client: Db, recordType: string) =>
  client
    .select()
    .from(dataFields)
    .where(
      and(
        eq(dataFields.type, 'relation'),
        sql`${dataFields.relation}->>'targetRecordType' = ${recordType}`,
      ),
    );

/** Drops a field's columns (or its relation's pairs table) and its definition. */
export const dropFieldStorage = async (client: Db, field: DataFieldRow) => {
  const table = await tableOf(client, field.recordType);
  const columns = columnsOf(field);

  if (table && columns.length) await dropColumns(client, table, columns);

  const pairs = field.relation?.pairsTable;

  if (pairs) {
    await dropTable(client, pairs);
    await client.delete(dataTables).where(eq(dataTables.tableName, pairs));
  }

  await client.delete(dataFields).where(eq(dataFields.id, field.id));
};
