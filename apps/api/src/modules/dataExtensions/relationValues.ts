import { holdsMany } from '@erxes/core-contract';
import type { Db, DataFieldRelation } from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { type SQL, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { holdsLink, linkColumn } from './columns';
import {
  alias,
  customKeyOf,
  type DataFieldRow,
  fieldsById,
  qualified,
  tableOf,
} from './definitions';

/**
 * Relation values. A link is kept once: in the "many" side's own column (`<column>_id`), or
 * for many-to-many in a pairs table. The other side reads it from there.
 */

/** A relation field with where both its sides keep their records. */
export interface RelationSide {
  field: DataFieldRow;
  relation: DataFieldRelation;
  /** Whether this side's table holds the link column. */
  holds: boolean;
  many: boolean;
  /** The other side's table and its id column. */
  other: { table: string; id: string; custom: boolean };
  /** The other side's link column, when it holds the link. */
  otherLink: string | null;
}

const idColumnOf = (recordType: string) => (customKeyOf(recordType) ? 'id' : 'record_id');

/** The relation fields among `fields`, each with its other side, by field id. */
export const relationSides = async (client: Db, fields: DataFieldRow[]) => {
  const relations = fields.flatMap((field) =>
    field.type === 'relation' && field.relation ? [{ field, relation: field.relation }] : [],
  );

  const inverses = new Map(
    (
      await fieldsById(
        client,
        relations.map(({ relation }) => relation.inverseFieldId),
      )
    ).map((row) => [row.id, row]),
  );

  const types = [...new Set(relations.map(({ relation }) => relation.targetRecordType))];

  const tables = new Map(
    await Promise.all(types.map(async (type) => [type, await tableOf(client, type)] as const)),
  );

  return new Map(
    relations.map(({ field, relation }) => {
      const inverse = inverses.get(relation.inverseFieldId);
      const table = tables.get(relation.targetRecordType);

      if (!inverse?.relation || !table) throw notFound('The other side of a relation');

      const otherHolds = holdsLink(inverse.relation);

      const side: RelationSide = {
        field,
        relation,
        holds: holdsLink(relation),
        many: holdsMany(relation),
        other: {
          table,
          id: idColumnOf(relation.targetRecordType),
          custom: customKeyOf(relation.targetRecordType) !== null,
        },
        otherLink: otherHolds && inverse.column ? linkColumn(inverse.column) : null,
      };

      return [field.id, side];
    }),
  );
};

/** Only records in use: one in the recycle bin isn't linked. */
const inUse = (side: RelationSide, table: SQL) =>
  side.other.custom ? sql` and ${table}.deleted_at is null` : sql``;

/** Most links a read returns for one value, as many as a write may set. */
const READ_MAX = 100;

/**
 * A relation's value for the record whose id is `recordId`, read where it's kept. `table` is
 * the record's own table, aliased, for the side that holds the link.
 */
export const readRelation = (side: RelationSide, table: SQL, recordId: SQL): SQL => {
  const o = alias('o');
  const other = qualified(side.other.table);
  const otherId = sql`${o}.${sql.identifier(side.other.id)}`;
  const { pairsTable } = side.relation;

  if (side.holds && side.field.column) {
    const link = sql`${table}.${sql.identifier(linkColumn(side.field.column))}`;

    return side.other.custom
      ? sql`(select ${otherId} from ${other} ${o} where ${otherId} = ${link}${inUse(side, o)})`
      : link;
  }

  if (pairsTable) {
    const [mine, theirs] =
      side.relation.side === 'source' ? ['source_id', 'target_id'] : ['target_id', 'source_id'];

    const p = alias('p');
    const target = sql`${p}.${sql.identifier(theirs)}`;

    const exists = side.other.custom
      ? sql` and exists (select 1 from ${other} ${o} where ${otherId} = ${target}${inUse(side, o)})`
      : sql``;

    return sql`array(select ${target} from ${qualified(pairsTable)} ${p} where ${p}.${sql.identifier(mine)} = ${recordId}${exists} order by ${p}.created_at limit ${READ_MAX})`;
  }

  if (!side.otherLink) return sql`null`;

  const where = sql`${o}.${sql.identifier(side.otherLink)} = ${recordId}${inUse(side, o)}`;

  return side.many
    ? sql`array(select ${otherId} from ${other} ${o} where ${where} order by ${otherId} limit ${READ_MAX})`
    : sql`(select ${otherId} from ${other} ${o} where ${where} limit 1)`;
};

const idsOf = (value: unknown) =>
  Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];

/** Rows of a host table for these ids, so a link can be set on them. */
const ensureHostRows = (client: Db, table: string, ids: string[]) =>
  ids.length
    ? client.execute(
        sql`insert into ${qualified(table)} (record_id) select unnest(${textArray(ids)}) on conflict do nothing`,
      )
    : undefined;

/**
 * Writes a relation value kept outside the record's own row: the other side's link column, or
 * the pairs. A value the record's own column holds goes with its other columns.
 */
export const writeRelation = async (
  client: Db,
  side: RelationSide,
  recordId: string,
  value: unknown,
) => {
  const ids = side.many ? idsOf(value) : typeof value === 'string' ? [value] : [];
  const { pairsTable } = side.relation;

  if (pairsTable) {
    const [mine, theirs] =
      side.relation.side === 'source' ? ['source_id', 'target_id'] : ['target_id', 'source_id'];

    const pairs = qualified(pairsTable);

    await client.execute(
      sql`delete from ${pairs} where ${sql.identifier(mine)} = ${recordId} and not (${sql.identifier(theirs)} = any(${textArray(ids)}))`,
    );

    if (ids.length) {
      await client.execute(
        sql`insert into ${pairs} (${sql.identifier(mine)}, ${sql.identifier(theirs)}) select ${recordId}, unnest(${textArray(ids)}) on conflict do nothing`,
      );
    }

    return;
  }

  if (!side.otherLink) return;

  const other = qualified(side.other.table);
  const link = sql.identifier(side.otherLink);
  const id = sql.identifier(side.other.id);

  await client.execute(
    sql`update ${other} set ${link} = null where ${link} = ${recordId} and not (${id} = any(${textArray(ids)}))`,
  );

  if (!side.other.custom) await ensureHostRows(client, side.other.table, ids);

  if (ids.length) {
    await client.execute(
      sql`update ${other} set ${link} = ${recordId} where ${id} = any(${textArray(ids)})`,
    );
  }
};
