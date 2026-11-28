import type { DataExtensionFieldCreate } from '@erxes/core-contract';
import { callerUserId, type Db, dataFields, dataObjects, newId } from '@erxes/core-db';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { fail } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { inOrder } from '~/lib/sequence';
import { columnsOf, freeColumn } from './columns';
import { addColumns, changeSchema, setUnique } from './ddl';
import { type DataFieldRow, ensureTable, findField } from './definitions';
import {
  assertFieldDefinition,
  assertPluginReads,
  assertRoom,
  extendableType,
  nextPosition,
  takenColumns,
} from './fieldRules';
import { dropFieldStorage } from './fieldStorage';

/** The fields of a record type: definitions, and the columns their values are kept in. */

type Status = DataFieldRow['status'];

export const listFields = async (client: Db, recordType: string, archived = false) => {
  assertPluginReads(recordType);
  await extendableType(client, recordType);

  const rows = await wholeList((limit) =>
    client
      .select()
      .from(dataFields)
      .where(
        and(
          eq(dataFields.recordType, recordType),
          eq(dataFields.status, archived ? 'archived' : 'active'),
        ),
      )
      .orderBy(asc(dataFields.position), asc(dataFields.createdAt))
      .limit(limit),
  );

  return { data: rows };
};

export const createField = async (client: Db, input: z.infer<typeof DataExtensionFieldCreate>) => {
  await extendableType(client, input.recordType);
  await assertRoom(client, input.recordType);

  const field = { ...input, options: input.options ?? [], settings: input.settings ?? {} };

  assertFieldDefinition(field);

  const column = freeColumn(input.key, await takenColumns(client, input.recordType));

  const row = oneRow(
    await client
      .insert(dataFields)
      .values({
        ...field,
        id: newId(),
        column,
        position: await nextPosition(client, input.recordType),
        createdBy: callerUserId(),
      })
      .returning(),
  );

  await changeSchema(client, async () => {
    const table = await ensureTable(client, input.recordType);
    const [first] = columnsOf(row);

    await addColumns(client, table, columnsOf(row));

    if (row.settings.unique && first) await setUnique(client, table, first.name, true);
  });

  return row;
};

/** Both sides of a relation, or the field alone. */
const withPair = async (client: Db, field: DataFieldRow) => {
  const inverseId = field.relation?.inverseFieldId;

  return inverseId && inverseId !== field.id
    ? [field, await findField(client, inverseId)]
    : [field];
};

/** Puts a record type's fields in the order of `ids`; fields it leaves out keep theirs after. */
export const reorderFields = async (client: Db, recordType: string, ids: string[]) => {
  await extendableType(client, recordType);

  const unique = [...new Set(ids)];

  await client
    .update(dataFields)
    .set({
      position: sql`case ${sql.join(
        unique.map((id, index) => sql`when ${dataFields.id} = ${id} then ${index}::int`),
        sql` `,
      )} else ${dataFields.position} + ${unique.length} end`,
      updatedAt: sql`now()`,
    })
    .where(eq(dataFields.recordType, recordType));

  return listFields(client, recordType);
};

/**
 * Archives or restores a field; a relation's two sides go together. An archived field that
 * names an object's records stops naming them.
 */
export const setFieldStatus = async (client: Db, id: string, status: Status) => {
  const field = await findField(client, id);
  const ids = (await withPair(client, field)).map((row) => row.id);

  if (status === 'active') await extendableType(client, field.recordType);

  await client
    .update(dataFields)
    .set({ status, updatedAt: sql`now()` })
    .where(inArray(dataFields.id, ids));

  if (status === 'archived') {
    await client
      .update(dataObjects)
      .set({ labelFieldId: null, updatedAt: sql`now()` })
      .where(inArray(dataObjects.labelFieldId, ids));
  }

  return findField(client, id);
};

/** Drops an archived field and its values; a relation's two sides go together. */
export const removeField = async (client: Db, id: string) => {
  const field = await findField(client, id);

  if (field.status === 'active') {
    throw fail('ARCHIVE_FIRST', `Archive ${field.label} before deleting it`);
  }

  const pair = await withPair(client, field);

  await changeSchema(client, () => inOrder(pair, (row) => dropFieldStorage(client, row)));

  return { id };
};
