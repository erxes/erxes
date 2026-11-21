import { type SQL, sql } from 'drizzle-orm';
import { pluginOf } from './columns';
import type { Computer, RecordRow, TypeModel } from './computed';
import { customKeyOf, qualified } from './definitions';
import { heldLink, type RelationSide } from './relationValues';

/**
 * The records a relation links to one record, as a `from` and `where` a subquery reads: a
 * custom object's in use, a core record's Data Extensions row joined to its own fields, or a
 * plugin's record from its view, which has both (and leaves out records the plugin no longer
 * has).
 */
export interface Related {
  from: SQL;
  where: SQL;
  row: RecordRow;
}

const at = (alias: SQL, column: string) => sql`${alias}.${sql.identifier(column)}`;

/** No records: a link kept in a row the record doesn't have yet. */
const none = (): Related => ({
  from: sql`(select null::text as id) ${sql.identifier('none')}`,
  where: sql`false`,
  row: { ext: null, native: null, id: sql`null::text` },
});

/** The target's records whose ids `id` reads: the join that gives each its row, and the row. */
interface Joined {
  join: SQL;
  where: SQL;
  row: RecordRow;
}

const joinTarget = (computer: Computer, target: TypeModel, id: SQL): Joined | null => {
  const o = computer.alias('o');
  const n = computer.alias('n');

  if (pluginOf(target.recordType)) {
    return target.native?.from
      ? {
          join: sql` join ${target.native.from} ${n} on ${at(n, target.native.id)} = ${id}`,
          where: sql`true`,
          row: { ext: n, native: n, id },
        }
      : null;
  }

  if (!target.table) return null;

  const table = qualified(target.table);

  if (customKeyOf(target.recordType)) {
    return {
      join: sql` join ${table} ${o} on ${o}.id = ${id} and ${o}.deleted_at is null`,
      where: sql`true`,
      row: { ext: o, native: o, id },
    };
  }

  // Only core records that still exist, where their own fields can tell.
  return {
    join: sql` left join ${table} ${o} on ${o}.record_id = ${id}${computer.nativeJoin(target, n, id)}`,
    where: target.native?.from ? sql`${at(n, target.native.id)} is not null` : sql`true`,
    row: { ext: o, native: computer.nativeRow(target, o, n), id },
  };
};

/** The ids `row`'s record links through a side that holds the link, as a one-column `from`. */
const heldIds = (side: RelationSide, row: SQL, k: SQL) => {
  const link = heldLink(side.field, row);

  return side.many ? sql`unnest(${link}) ${k}(id)` : sql`(select ${link} as id) ${k}`;
};

export const relatedRows = (
  computer: Computer,
  side: RelationSide,
  row: RecordRow,
  target: TypeModel,
): Related => {
  const { pairsTable } = side.relation;

  if (side.holds) {
    if (!row.ext) return none();

    const k = computer.alias('k');
    const joined = joinTarget(computer, target, sql`${k}.id`);

    return joined
      ? {
          from: sql`${heldIds(side, row.ext, k)}${joined.join}`,
          where: joined.where,
          row: joined.row,
        }
      : none();
  }

  if (pairsTable) {
    const p = computer.alias('p');

    const [mine, theirs] =
      side.relation.side === 'source' ? ['source_id', 'target_id'] : ['target_id', 'source_id'];

    const joined = joinTarget(computer, target, at(p, theirs));

    return joined
      ? {
          from: sql`${qualified(pairsTable)} ${p}${joined.join}`,
          where: sql`${at(p, mine)} = ${row.id} and ${joined.where}`,
          row: joined.row,
        }
      : none();
  }

  return linkedFromOther(computer, side, row, target);
};

/** Records whose own side holds the link to `row`'s record. */
const linkedFromOther = (
  computer: Computer,
  side: RelationSide,
  row: RecordRow,
  target: TypeModel,
): Related => {
  const { otherLinks } = side;
  const o = computer.alias('o');
  const n = computer.alias('n');

  if (!otherLinks) return none();

  if (pluginOf(target.recordType)) {
    const native = target.native;

    return native?.from
      ? {
          from: sql`${native.from} ${n}`,
          where: otherLinks(n, row.id),
          row: { ext: n, native: n, id: at(n, native.id) },
        }
      : none();
  }

  if (!target.table) return none();

  const table = qualified(target.table);

  if (customKeyOf(target.recordType)) {
    return {
      from: sql`${table} ${o}`,
      where: sql`${otherLinks(o, row.id)} and ${o}.deleted_at is null`,
      row: { ext: o, native: o, id: sql`${o}.id` },
    };
  }

  const id = sql`${o}.record_id`;

  return {
    from: sql`${table} ${o}${computer.nativeJoin(target, n, id)}`,
    where: sql`${otherLinks(o, row.id)}${target.native?.from ? sql` and ${at(n, target.native.id)} is not null` : sql``}`,
    row: { ext: o, native: computer.nativeRow(target, o, n), id },
  };
};
