import { type SQL, sql } from 'drizzle-orm';
import { linkColumn } from './columns';
import type { Computer, RecordRow, TypeModel } from './computed';
import { customKeyOf, qualified } from './definitions';
import type { RelationSide } from './relationValues';

/**
 * The records a relation links to one record, as a `from` and `where` a subquery reads: a
 * custom object's in use, or a core or plugin record's Data Extensions row joined to its own
 * fields (which leaves out records their owner no longer has).
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

export const relatedRows = (
  computer: Computer,
  side: RelationSide,
  row: RecordRow,
  target: TypeModel,
): Related => {
  const o = computer.alias('o');
  const n = computer.alias('n');
  const custom = customKeyOf(target.recordType) !== null;
  const table = target.table ? qualified(target.table) : null;
  const { pairsTable } = side.relation;

  if (!table) return none();

  // A custom object's own fields are on its table; a host's are joined by id.
  const hosted = (id: SQL): RecordRow => ({
    ext: o,
    native: computer.nativeRow(target, o, n),
    id,
  });

  if (side.holds && side.field.column) {
    if (!row.ext) return none();

    const link = at(row.ext, linkColumn(side.field.column));

    if (custom) {
      return {
        from: sql`${table} ${o}`,
        where: sql`${o}.id = ${link} and ${o}.deleted_at is null`,
        row: hosted(sql`${o}.id`),
      };
    }

    const k = computer.alias('k');
    const id = sql`${k}.id`;

    return {
      from: sql`(select ${link} as id) ${k} left join ${table} ${o} on ${o}.record_id = ${id}${computer.nativeJoin(target, n, id)}`,
      where: sql`true${hostExists(target, n)}`,
      row: hosted(id),
    };
  }

  if (pairsTable) {
    const p = computer.alias('p');

    const [mine, theirs] =
      side.relation.side === 'source' ? ['source_id', 'target_id'] : ['target_id', 'source_id'];

    const id = at(p, theirs);

    const join = custom
      ? sql` join ${table} ${o} on ${o}.id = ${id} and ${o}.deleted_at is null`
      : sql` left join ${table} ${o} on ${o}.record_id = ${id}${computer.nativeJoin(target, n, id)}`;

    return {
      from: sql`${qualified(pairsTable)} ${p}${join}`,
      where: sql`${at(p, mine)} = ${row.id}${hostExists(target, n)}`,
      row: hosted(id),
    };
  }

  if (!side.otherLink) return none();

  const link = at(o, side.otherLink);

  return custom
    ? {
        from: sql`${table} ${o}`,
        where: sql`${link} = ${row.id} and ${o}.deleted_at is null`,
        row: hosted(sql`${o}.id`),
      }
    : {
        from: sql`${table} ${o}${computer.nativeJoin(target, n, sql`${o}.record_id`)}`,
        where: sql`${link} = ${row.id}${hostExists(target, n)}`,
        row: hosted(sql`${o}.record_id`),
      };
};

/** Only host records their owner still has, where their own fields can tell. */
const hostExists = (target: TypeModel, n: SQL) =>
  !customKeyOf(target.recordType) && target.native?.from
    ? sql` and ${n}.${sql.identifier(target.native.id)} is not null`
    : sql``;
