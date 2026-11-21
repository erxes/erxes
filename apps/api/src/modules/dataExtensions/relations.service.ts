import {
  callerUserId,
  type Db,
  type DataFieldRelation,
  dataFields,
  dataTables,
  newId,
} from '@erxes/core-db';
import type { DATA_EXTENSION_ON_DELETE } from '@erxes/core-db/dataExtensionEnums';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { freeColumn, holdsLink, linkColumn, objectTable, pairsTable, pluginOf } from './columns';
import { addColumns, addReference, changeSchema, createTable, setUnique } from './ddl';
import { customKeyOf, ensureTable } from './definitions';
import { assertRoom, extendableType, nextPosition, takenColumns } from './fieldRules';

/**
 * Relations: a field on each of two record types, made together. The "many" side (or a
 * one-to-one's source) keeps the link in an id column; a many-to-many keeps pairs in a table.
 * A plugin's side that keeps the link keeps it in its record's `custom_fields`, a many-to-many
 * with a plugin's records included, so core makes no table for it.
 * A link to a custom object's records has a foreign key, so deleting the record for good
 * clears it (or deletes this side's record, for `cascade` between custom objects).
 */

type Kind = DataFieldRelation['kind'];

interface Side {
  id: string;
  recordType: string;
  key: string;
  label: string;
  relation: DataFieldRelation;
}

/** Where a side keeps its link: its column (when it holds one), and the column's index. */
const linkStorage = async (
  client: Db,
  side: Side,
  taken: Set<string>,
  onDelete: (typeof DATA_EXTENSION_ON_DELETE)[number],
) => {
  if (!holdsLink(side.recordType, side.relation)) return null;

  const column = freeColumn(side.key, taken);

  taken.add(column);

  // A plugin keeps the link in its record's `custom_fields`.
  if (pluginOf(side.recordType)) return column;

  const table = await ensureTable(client, side.recordType);
  const link = linkColumn(column);
  const targetKey = customKeyOf(side.relation.targetRecordType);

  await addColumns(client, table, [{ part: null, name: link, type: 'text' }], true);

  if (side.relation.kind === 'oneToOne') await setUnique(client, table, link, true);

  if (targetKey) {
    // Deleting a record for good deletes the records linked to it only between custom objects.
    const rule = customKeyOf(side.recordType) ? onDelete : 'setNull';

    await addReference(client, table, link, objectTable(targetKey), rule);
  }

  return column;
};

/** A many-to-many's pairs table, with a foreign key to each custom side. */
const pairsStorage = async (client: Db, source: Side) => {
  const table = pairsTable(source.id);

  await createTable(client, table, 'pairs');
  await client.insert(dataTables).values({ recordType: table, tableName: table, kind: 'pairs' });

  const sides: [string, string][] = [
    ['source_id', source.recordType],
    ['target_id', source.relation.targetRecordType],
  ];

  await inOrder(sides, async ([column, recordType]) => {
    const key = customKeyOf(recordType);

    if (key) await addReference(client, table, column, objectTable(key), 'cascade');
  });

  return table;
};

interface RelationInput {
  recordType: string;
  key: string;
  label: string;
  targetRecordType: string;
  kind: Kind;
  inverseKey: string;
  inverseLabel: string;
  onDelete: (typeof DATA_EXTENSION_ON_DELETE)[number];
}

/**
 * Whether a relation keeps a table of pairs: a many-to-many between records core keeps. With a
 * plugin's records, the plugin's side keeps the ids (`holdsLink`).
 */
const keepsPairs = (input: Pick<RelationInput, 'kind' | 'recordType' | 'targetRecordType'>) =>
  input.kind === 'manyToMany' && !pluginOf(input.recordType) && !pluginOf(input.targetRecordType);

/** The relation's two sides, each pointing at the other. */
const sidesOf = (input: RelationInput): [source: Side, inverse: Side] => {
  const sourceId = newId();
  const inverseId = newId();
  const pairs = keepsPairs(input) ? pairsTable(sourceId) : null;
  const base = { kind: input.kind, onDelete: input.onDelete, pairsTable: pairs };

  const source: Side = {
    id: sourceId,
    recordType: input.recordType,
    key: input.key,
    label: input.label,
    relation: {
      ...base,
      targetRecordType: input.targetRecordType,
      side: 'source',
      inverseFieldId: inverseId,
    },
  };

  const inverse: Side = {
    id: inverseId,
    recordType: input.targetRecordType,
    key: input.inverseKey,
    label: input.inverseLabel,
    relation: {
      ...base,
      targetRecordType: input.recordType,
      side: 'inverse',
      inverseFieldId: sourceId,
    },
  };

  return [source, inverse];
};

export const createRelation = async (client: Db, input: RelationInput) => {
  const self = input.recordType === input.targetRecordType;

  if (self && input.key === input.inverseKey) {
    throw fail('TAKEN', 'A relation to its own record type needs two keys', {
      field: 'inverseKey',
    });
  }

  await extendableType(client, input.recordType);
  await extendableType(client, input.targetRecordType, 'targetRecordType');
  await assertRoom(client, input.recordType, self ? 2 : 1);

  if (!self) await assertRoom(client, input.targetRecordType);

  const [source, inverse] = sidesOf(input);

  const columns = await changeSchema(client, async () => {
    const sourceTaken = await takenColumns(client, input.recordType);
    const inverseTaken = self ? sourceTaken : await takenColumns(client, input.targetRecordType);
    const sourceColumn = await linkStorage(client, source, sourceTaken, input.onDelete);
    const inverseColumn = await linkStorage(client, inverse, inverseTaken, input.onDelete);

    await inOrder(
      [input.recordType, input.targetRecordType].filter((type) => !pluginOf(type)),
      (type) => ensureTable(client, type),
    );

    if (source.relation.pairsTable) await pairsStorage(client, source);

    return { source: sourceColumn, inverse: inverseColumn };
  });

  return saveSides(client, source, inverse, columns);
};

/** Both sides' definitions, each at the end of its record type's fields. */
const saveSides = async (
  client: Db,
  source: Side,
  inverse: Side,
  columns: { source: string | null; inverse: string | null },
) => {
  const sourcePosition = await nextPosition(client, source.recordType);

  const inversePosition =
    source.recordType === inverse.recordType
      ? sourcePosition + 1
      : await nextPosition(client, inverse.recordType);

  const rows = await client
    .insert(dataFields)
    .values([
      {
        ...source,
        type: 'relation',
        column: columns.source,
        position: sourcePosition,
        createdBy: callerUserId(),
      },
      {
        ...inverse,
        type: 'relation',
        column: columns.inverse,
        position: inversePosition,
        createdBy: callerUserId(),
      },
    ])
    .returning();

  const field = rows.find((row) => row.id === source.id);
  const inverseField = rows.find((row) => row.id === inverse.id);

  if (!field || !inverseField) throw new Error('Expected both sides of the relation back');

  return { field, inverse: inverseField };
};
