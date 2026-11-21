import type { CursorQuery, PageInfo } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import { and, type SQL, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { sortedWalk } from '~/lib/sortedWalk';

/**
 * Keyset paging over a custom object's records in any order: (sort value, id), with records
 * that have no value last (`sortedWalk`).
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

const select = (
  client: Db,
  source: PageSource,
  where: SQL | undefined,
  order: SQL[],
  limit: number,
) =>
  client.execute<Row>(
    sql`select ${source.table}.id, ${sql.join(source.columns, sql`, `)} from ${source.from} where ${where ?? sql`true`} order by ${sql.join(order, sql`, `)} limit ${limit}`,
  );

export const recordPage = async (client: Db, source: PageSource, query: CursorQuery) => {
  const forward = query.direction === 'forward';
  const { table, from } = source;
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

  const walk = sortedWalk({ ...source, id: sql`${table}.id` }, query, cursor);

  const { rows } = await select(
    client,
    source,
    and(source.where, walk.page),
    walk.order,
    query.limit + 1,
  );

  const back = walk.back
    ? (await select(client, source, and(source.where, walk.back), walk.order, 1)).rows
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
