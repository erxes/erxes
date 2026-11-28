import { holdsMany } from '@erxes/core-contract';
import type { Db, DataFieldRelation } from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { type SQL, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { storedColumn } from './codec';
import { columnsOf, holdsLink, linkColumn, pluginOf } from './columns';
import {
  alias,
  customKeyOf,
  type DataFieldRow,
  fieldsById,
  qualified,
  tableOf,
} from './definitions';
import { nativeSources, type NativeSources } from './nativeSources';

/**
 * Relation values. A link is kept once: in the "many" side's own column (`<column>_id`), or
 * for many-to-many in a pairs table. A plugin's side keeps it in its record's `custom_fields`
 * instead, the ids of a many-to-many included. The other side reads it from there.
 */

/** A relation field with where both its sides keep their records. */
export interface RelationSide {
  field: DataFieldRow;
  relation: DataFieldRelation;
  /** Whether this side keeps the link with its record. */
  holds: boolean;
  many: boolean;
  /**
   * The other side's records: core's Data Extensions table (`table`), a custom object's, or a
   * plugin's view, as `from` (null when core can't read the view), and its id column.
   */
  other: { table: string | null; from: SQL | null; id: string; custom: boolean; plugin: boolean };
  /** The other side's link column, when it holds the link and core keeps it. */
  otherLink: string | null;
  /** Whether the other side's row (aliased) links to a record, when the other side holds the link. */
  otherLinks: ((row: SQL, recordId: SQL) => SQL) | null;
}

/** How the other side links to a record when it holds the link: a column, or a plugin's `custom_fields`. */
const linksOf = (inverse: DataFieldRow): Pick<RelationSide, 'otherLink' | 'otherLinks'> => {
  if (!inverse.relation || !inverse.column || !holdsLink(inverse.recordType, inverse.relation)) {
    return { otherLink: null, otherLinks: null };
  }

  if (pluginOf(inverse.recordType)) {
    return {
      otherLink: null,
      otherLinks: (row, id) =>
        sql`(${row}.custom_fields -> ${inverse.id}::text) @> to_jsonb(${id}::text)`,
    };
  }

  const column = linkColumn(inverse.column);

  return {
    otherLink: column,
    otherLinks: (row, id) => sql`${row}.${sql.identifier(column)} = ${id}`,
  };
};

/** Where the records of a relation's target are: core's table, or a plugin's view. */
const otherOf = (
  recordType: string,
  table: string | null,
  natives: NativeSources | null,
): RelationSide['other'] => {
  const plugin = pluginOf(recordType) !== null;
  const custom = customKeyOf(recordType) !== null;

  return {
    table,
    from: table ? qualified(table) : (natives?.(recordType)?.from ?? null),
    id: custom || plugin ? 'id' : 'record_id',
    custom,
    plugin,
  };
};

/**
 * The relation fields among `fields`, each with its other side, by field id. `natives` saves
 * loading the plugins' views again where the caller has them.
 */
export const relationSides = async (
  client: Db,
  fields: DataFieldRow[],
  natives?: NativeSources,
) => {
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
    await Promise.all(
      types.map(
        async (type) => [type, pluginOf(type) ? null : await tableOf(client, type)] as const,
      ),
    ),
  );

  const views = types.some((type) => pluginOf(type))
    ? (natives ?? (await nativeSources(client)))
    : null;

  return new Map(
    relations.map(({ field, relation }) => {
      const inverse = inverses.get(relation.inverseFieldId);
      const table = tables.get(relation.targetRecordType) ?? null;

      if (!inverse?.relation || (!table && !pluginOf(relation.targetRecordType))) {
        throw notFound('The other side of a relation');
      }

      const side: RelationSide = {
        field,
        relation,
        holds: holdsLink(field.recordType, relation),
        many: holdsMany(relation),
        other: otherOf(relation.targetRecordType, table, views),
        ...linksOf(inverse),
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

/** A holding side's link over its record's row: the id, or a plugin's many-to-many's ids. */
export const heldLink = (field: DataFieldRow, row: SQL) => {
  const [column] = columnsOf(field);

  return column ? storedColumn(field, row, column) : sql`null`;
};

/** The link a side holds, less the custom records not in use. */
const readHeld = (side: RelationSide, table: SQL) => {
  const link = heldLink(side.field, table);
  const { from } = side.other;

  if (!side.other.custom || !from) return link;

  const o = alias('o');
  const otherId = sql`${o}.${sql.identifier(side.other.id)}`;

  if (!side.many) {
    return sql`(select ${otherId} from ${from} ${o} where ${otherId} = ${link}${inUse(side, o)})`;
  }

  const e = alias('e');

  return sql`array(select ${e}.id from unnest(${link}) ${e}(id) where exists (select 1 from ${from} ${o} where ${otherId} = ${e}.id${inUse(side, o)}) limit ${READ_MAX})`;
};

/**
 * A relation's value for the record whose id is `recordId`, read where it's kept. `table` is
 * the record's own row, aliased, for the side that holds the link.
 */
export const readRelation = (side: RelationSide, table: SQL, recordId: SQL): SQL => {
  const o = alias('o');
  const { from } = side.other;
  const otherId = sql`${o}.${sql.identifier(side.other.id)}`;
  const { pairsTable } = side.relation;

  if (side.holds) return readHeld(side, table);

  if (pairsTable && from) {
    const [mine, theirs] =
      side.relation.side === 'source' ? ['source_id', 'target_id'] : ['target_id', 'source_id'];

    const p = alias('p');
    const target = sql`${p}.${sql.identifier(theirs)}`;

    const exists = side.other.custom
      ? sql` and exists (select 1 from ${from} ${o} where ${otherId} = ${target}${inUse(side, o)})`
      : sql``;

    return sql`array(select ${target} from ${qualified(pairsTable)} ${p} where ${p}.${sql.identifier(mine)} = ${recordId}${exists} order by ${p}.created_at limit ${READ_MAX})`;
  }

  if (!side.otherLinks || !from) return sql`null`;

  const where = sql`${side.otherLinks(o, recordId)}${inUse(side, o)}`;

  return side.many
    ? sql`array(select ${otherId} from ${from} ${o} where ${where} order by ${otherId} limit ${READ_MAX})`
    : sql`(select ${otherId} from ${from} ${o} where ${where} limit 1)`;
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
 * Writes a relation value kept outside the record's own row, when core keeps it: the other
 * side's link column, or the pairs. A value the record's own column holds goes with its other
 * columns.
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

  if (!side.otherLink || !side.other.table) return;

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
