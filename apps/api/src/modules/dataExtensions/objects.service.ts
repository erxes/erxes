import {
  customObjectType,
  type DataExtensionObjectCreate,
  type DataExtensionObjectUpdate,
} from '@erxes/core-contract';
import type { z } from 'zod';
import { callerUserId, type Db, dataFields, dataObjects, dataTables, newId } from '@erxes/core-db';
import { and, asc, count, eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { inOrder } from '~/lib/sequence';
import { columnsOf, objectTable } from './columns';
import { addColumns, changeSchema, dropTable } from './ddl';
import { ensureTable, findObject, OBJECTS_MAX, objectOut } from './definitions';
import { dropFieldStorage, relationsTo } from './fieldStorage';

/** Custom objects: an organisation's own record types, each with its table. */

export const listObjects = async (client: Db, archived = false) => {
  const rows = await wholeList((limit) =>
    client
      .select()
      .from(dataObjects)
      .where(eq(dataObjects.status, archived ? 'archived' : 'active'))
      .orderBy(asc(dataObjects.pluralLabel))
      .limit(limit),
  );

  return { data: rows.map(objectOut) };
};

export const getObject = async (client: Db, key: string) =>
  objectOut(await findObject(client, key));

/** Adds an object, its table and its `name` field, which names its records. */
export const createObject = async (
  client: Db,
  input: z.infer<typeof DataExtensionObjectCreate>,
) => {
  const [counted] = await client.select({ total: count() }).from(dataObjects);

  if ((counted?.total ?? 0) >= OBJECTS_MAX) {
    throw fail('LIMIT_EXCEEDED', `An organisation has at most ${OBJECTS_MAX} custom objects`);
  }

  const recordType = customObjectType(input.key);

  const nameField = {
    id: newId(),
    recordType,
    key: 'name',
    label: 'Name',
    type: 'text' as const,
    column: 'name',
    createdBy: callerUserId(),
  };

  const object = oneRow(
    await client
      .insert(dataObjects)
      .values({ ...input, id: newId(), labelFieldId: nameField.id, createdBy: callerUserId() })
      .returning(),
  );

  await changeSchema(client, async () => {
    const table = await ensureTable(client, recordType);

    await addColumns(client, table, columnsOf({ ...nameField, relation: null, settings: {} }));
  });
  await client.insert(dataFields).values(nameField);

  return objectOut(object);
};

export const updateObject = async (
  client: Db,
  { key, ...changes }: z.infer<typeof DataExtensionObjectUpdate>,
) => {
  const object = await findObject(client, key);

  if (changes.labelFieldId) {
    const [field] = await client
      .select()
      .from(dataFields)
      .where(
        and(
          eq(dataFields.id, changes.labelFieldId),
          eq(dataFields.recordType, customObjectType(key)),
          eq(dataFields.status, 'active'),
        ),
      )
      .limit(1);

    if (!field || (field.type !== 'text' && field.type !== 'fullName')) {
      throw fail(
        'INVALID_REFERENCE',
        'The label field is an active text or name field of the object',
        {
          field: 'labelFieldId',
        },
      );
    }
  }

  const row = oneRow(
    await client
      .update(dataObjects)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(dataObjects.id, object.id))
      .returning(),
  );

  return objectOut(row);
};

export const setObjectStatus = async (client: Db, key: string, status: 'active' | 'archived') => {
  const object = await findObject(client, key);

  const row = oneRow(
    await client
      .update(dataObjects)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(dataObjects.id, object.id))
      .returning(),
  );

  return objectOut(row);
};

/**
 * Drops an archived object: its table and records, its fields, and the relations other record
 * types have to it. 409 ARCHIVE_FIRST while it is active.
 */
export const removeObject = async (client: Db, key: string) => {
  const object = await findObject(client, key);

  if (object.status === 'active') {
    throw fail('ARCHIVE_FIRST', `Archive ${object.pluralLabel} before deleting them`);
  }

  const recordType = customObjectType(key);

  await changeSchema(client, async () => {
    // Relations from other record types first, while both sides' definitions are there.
    await inOrder(await relationsTo(client, recordType), (field) =>
      dropFieldStorage(client, field),
    );
    await dropTable(client, objectTable(key));
  });
  await client.delete(dataFields).where(eq(dataFields.recordType, recordType));
  await client.delete(dataTables).where(eq(dataTables.recordType, recordType));
  await client.delete(dataObjects).where(eq(dataObjects.id, object.id));

  return { key };
};
