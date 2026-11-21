import type { CursorQuery, PageInfo } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import { and, type SQL, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';

/**
 * Keyset paging over a custom object's records in any order: (sort value, id), with records
 * that have no value last. The cursor is a record id; the page reads its sort value from the
 * table, so values keep full precision.
 */

export interface PageSource {
  /** The table, aliased as `table`. */
  from: SQL;
  table: SQL;
  /** The sort expression over `table`'s columns. */
  sort: SQL;
  descending: boolean;
  where: SQL | undefined;
  /** The value columns to read. */
  columns: SQL[];
}

type Row = Record<string, unknown> & { id: string };

/** Rows on the far side of the anchor, the way the page walks: `walk` is its comparison. */
const beyond = (source: PageSource, anchor: string, walk: '<' | '>', nullsAhead: boolean) => {
  const { table, sort, from } = source;
  const op = sql.raw(walk);
  const id = sql`${table}.id`;
  const value = sql`(select ${sort} from ${from} where ${id} = ${anchor})`;
  const tie = sql`(${sort} = ${value} and ${id} ${op} ${anchor})`;

  // Records without a value sit after those with one walking forward, before them walking back.
  return nullsAhead
    ? sql`(case when ${value} is null then (${sort} is null and ${id} ${op} ${anchor}) else (${sort} ${op} ${value} or ${tie} or ${sort} is null) end)`
    : sql`(case when ${value} is null then (${sort} is not null or ${id} ${op} ${anchor}) else (${sort} ${op} ${value} or ${tie}) end)`;
};

const select = (
  client: Db,
  source: PageSource,
  where: SQL | undefined,
  order: SQL,
  limit: number,
) =>
  client.execute<Row>(
    sql`select ${source.table}.id, ${sql.join(source.columns, sql`, `)} from ${source.from} where ${where ?? sql`true`} order by ${order} limit ${limit}`,
  );

export const recordPage = async (client: Db, source: PageSource, query: CursorQuery) => {
  const forward = query.direction === 'forward';
  const { table, sort, from } = source;
  let cursor = query.cursor;

  if (cursor) {
    const { rows } = await client.execute(
      sql`select 1 from ${from} where ${and(source.where, sql`${table}.id = ${cursor}`)}`,
    );

    if (!rows.length && query.cursorMode !== 'inclusive') {
      throw fail('INVALID_CURSOR', 'The cursor record no longer exists');
    }

    if (!rows.length) cursor = undefined;
  }

  // Forward walks the list's order; backward walks it the other way, then turns the page round.
  const ahead = forward === source.descending ? '<' : '>';
  const behind = ahead === '<' ? '>' : '<';
  const walk = forward ? ahead : behind;
  const direction = sql.raw(walk === '<' ? 'desc' : 'asc');
  const nulls = sql.raw(forward ? 'nulls last' : 'nulls first');
  const order = sql`${sort} ${direction} ${nulls}, ${table}.id ${direction}`;

  const inclusive = (condition: SQL) =>
    query.cursorMode === 'inclusive' && cursor
      ? sql`(${condition} or ${table}.id = ${cursor})`
      : condition;

  const page = cursor ? inclusive(beyond(source, cursor, walk, forward)) : undefined;
  const { rows } = await select(client, source, and(source.where, page), order, query.limit + 1);

  const back = cursor
    ? (
        await select(
          client,
          source,
          and(source.where, beyond(source, cursor, walk === '<' ? '>' : '<', !forward)),
          order,
          1,
        )
      ).rows
    : [];

  const { rows: totals } = await client.execute<{ total: number }>(
    sql`select count(*)::int as total from ${from} where ${source.where ?? sql`true`}`,
  );

  const more = rows.length > query.limit;
  const data = rows.slice(0, query.limit);

  if (!forward) data.reverse();

  const pageInfo: PageInfo = {
    hasNextPage: forward ? more : back.length > 0,
    hasPreviousPage: forward ? back.length > 0 : more,
    startCursor: data[0]?.id ?? null,
    endCursor: data.at(-1)?.id ?? null,
  };

  return { rows: data, pageInfo, totalCount: totals[0]?.total ?? 0 };
};
