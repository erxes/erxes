import { type CursorQuery, LIST_MAX, type PageInfo } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import type { SQL, Subquery } from 'drizzle-orm';
import { and, count, eq, sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { fail } from '~/http/errors';

export interface KeysetSource {
  /** A table, or a subquery whose `id` and `createdAt` are its own fields. */
  table: PgTable | Subquery;
  id: PgColumn | SQL.Aliased<string>;
  createdAt: PgColumn | SQL.Aliased<Date>;
  /** Rows the list draws from, when fewer than the organisation's; the cursor must be one of them. */
  scope?: SQL;
  /**
   * Stop counting at this many (`totalCount` = cap, `totalCapped` true), so
   * large logs page fast.
   */
  countCap?: number;
}

type Fetch<Row> = (where: SQL | undefined, orderBy: SQL[], limit: number) => Promise<Row[]>;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

/** `%value%` for ILIKE, with the user's own `%`, `_` and `\` taken literally. */
export const containsPattern = (value: string) => `%${escapeLike(value)}%`;

/**
 * A small config list read whole (`listOf` in the contract): `fetch` gets a
 * limit of `LIST_MAX + 1`, and a list past `LIST_MAX` throws, so one that
 * outgrew "small" fails loudly instead of losing rows. Page it with
 * `keysetPage` then.
 */
export const wholeList = async <Row>(fetch: (limit: number) => Promise<Row[]>) => {
  const rows = await fetch(LIST_MAX + 1);

  if (rows.length > LIST_MAX) {
    throw new Error(`A list read whole has more than ${LIST_MAX} rows; page it with keysetPage`);
  }

  return rows;
};

/**
 * The records matching `where`, on a list's first page only: no cursor, or reopening at one
 * (`inclusive`). The pages loaded while scrolling leave it out, so they never count again.
 */
const countRows = async (
  client: Db,
  source: KeysetSource,
  where: SQL | undefined,
  query: CursorQuery,
) => {
  if (query.cursor && query.cursorMode === 'exclusive') return undefined;

  return source.countCap
    ? (
        await client.execute<{ total: number }>(
          sql`select count(*)::int as total from (select 1 from ${source.table} where ${where ?? sql`true`} limit ${source.countCap + 1}) capped`,
        )
      ).rows
    : client.select({ total: count() }).from(source.table).where(where);
};

/**
 * Newest-first keyset paging over (created_at, id). The cursor is a record id;
 * comparisons read its position from the table itself, so timestamps keep full
 * precision. `fetch` runs the typed select with the page condition and order.
 */
export const keysetPage = async <Row extends { id: string }>(
  client: Db,
  source: KeysetSource,
  filters: SQL | undefined,
  query: CursorQuery,
  fetch: Fetch<Row>,
): Promise<{ data: Row[]; pageInfo: PageInfo; totalCount?: number; totalCapped?: boolean }> => {
  const { table, id, createdAt, scope } = source;
  const where = and(scope, filters);
  const forward = query.direction === 'forward';
  const inclusive = query.cursorMode === 'inclusive';

  let cursor = query.cursor;

  if (cursor) {
    const [anchor] = await client
      .select({ id })
      .from(table)
      .where(and(scope, eq(sql`${id}`, cursor)))
      .limit(1);

    if (!anchor) {
      // A list reopening at a remembered record that is gone starts from the top.
      if (!inclusive) {
        throw fail('INVALID_CURSOR', 'The cursor record no longer exists');
      }

      cursor = undefined;
    }
  }

  const position = (operator: '<' | '<=' | '>' | '>=') =>
    sql`(${createdAt}, ${id}) ${sql.raw(operator)} (select ${createdAt}, ${id} from ${table} where ${id} = ${cursor})`;

  // Newest first: "forward" walks to older rows, "backward" to newer ones.
  const pageSide = forward ? (inclusive ? '<=' : '<') : inclusive ? '>=' : '>';
  const otherSide = forward ? (inclusive ? '>' : '>=') : inclusive ? '<' : '<=';

  // One after another: inside a request `client` is its transaction, a single connection.
  // The lists' indexes are `(org_id, created_at DESC, id DESC)`, which Drizzle writes NULLS LAST:
  // the order spells that out (or its reverse) so Postgres reads the page from the index instead
  // of sorting every row of the organisation.
  const rows = await fetch(
    cursor ? and(where, position(pageSide)) : where,
    forward
      ? [sql`${createdAt} desc nulls last`, sql`${id} desc nulls last`]
      : [sql`${createdAt} asc nulls first`, sql`${id} asc nulls first`],
    query.limit + 1,
  );

  const totals = await countRows(client, source, where, query);

  const before = cursor
    ? await client
        .select({ id })
        .from(table)
        .where(and(where, position(otherSide)))
        .limit(1)
    : [];

  const more = rows.length > query.limit;
  const page = rows.slice(0, query.limit);

  if (!forward) {
    page.reverse();
  }

  return {
    data: page,
    pageInfo: {
      hasNextPage: forward ? more : before.length > 0,
      hasPreviousPage: forward ? before.length > 0 : more,
      startCursor: page[0]?.id ?? null,
      endCursor: page[page.length - 1]?.id ?? null,
    },
    ...(totals && {
      totalCount: Math.min(totals[0]?.total ?? 0, source.countCap ?? Infinity),
      totalCapped: source.countCap !== undefined && (totals[0]?.total ?? 0) > source.countCap,
    }),
  };
};
