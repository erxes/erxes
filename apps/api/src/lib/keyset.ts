import { type CursorQuery, LIST_MAX, type PageInfo } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import type { SQL, Subquery } from 'drizzle-orm';
import { and, count, eq, sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { fail } from '~/http/errors';
import { sortedWalk } from './sortedWalk';

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
  /** Order by this instead of newest first: records without a value last, then by id. */
  sort?: { expr: SQL; descending: boolean };
}

type Fetch<Row> = (where: SQL | undefined, orderBy: SQL[], limit: number) => Promise<Row[]>;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

/**
 * Newest first, as the lists' indexes are written: `(org_id, created_at DESC, id DESC)`, which
 * Drizzle makes NULLS LAST. Spelled out so Postgres reads a page from the index instead of
 * sorting every row of the organisation (`desc()` alone means NULLS FIRST and doesn't match).
 */
export const newestFirst = (createdAt: KeysetSource['createdAt'], id: KeysetSource['id']) => [
  sql`${createdAt} desc nulls last`,
  sql`${id} desc nulls last`,
];

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
 * The page's order, the rows on its side of the cursor (`page`) and those on the other side
 * (`back`): newest first over (created_at, id), where "forward" walks to older rows, or by
 * `sort`. Newest first reads its exact reverse going backward, so the page comes from the index
 * either way.
 */
const walkOf = (source: KeysetSource, query: CursorQuery, cursor: string | undefined) => {
  const { table, id, createdAt, sort } = source;

  if (sort) {
    return sortedWalk(
      { id: sql`${id}`, from: sql`${table}`, sort: sort.expr, descending: sort.descending },
      query,
      cursor,
    );
  }

  const forward = query.direction === 'forward';
  const inclusive = query.cursorMode === 'inclusive';

  const position = (operator: '<' | '<=' | '>' | '>=') =>
    sql`(${createdAt}, ${id}) ${sql.raw(operator)} (select ${createdAt}, ${id} from ${table} where ${id} = ${cursor})`;

  const pageSide = forward ? (inclusive ? '<=' : '<') : inclusive ? '>=' : '>';
  const otherSide = forward ? (inclusive ? '>' : '>=') : inclusive ? '<' : '<=';

  return {
    order: forward
      ? newestFirst(createdAt, id)
      : [sql`${createdAt} asc nulls first`, sql`${id} asc nulls first`],
    page: cursor ? position(pageSide) : undefined,
    back: cursor ? position(otherSide) : undefined,
  };
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
 * Whether the cursor's record is still among the list's rows (`anchor`), and whether any row lies
 * on the page's other side of it (`before`), in one statement: a scrolled page used to ask each
 * in a round trip of its own. With the record gone, its position is null and `before` is false.
 */
const aroundCursor = async (
  client: Db,
  table: KeysetSource['table'],
  anchor: SQL | undefined,
  other: SQL | undefined,
) => {
  const result = await client.execute<{ anchor: boolean; before: boolean }>(
    sql`select exists (select 1 from ${table} where ${anchor ?? sql`true`}) as anchor,
      exists (select 1 from ${table} where ${other ?? sql`true`}) as before`,
  );

  return result.rows[0] ?? { anchor: false, before: false };
};

/**
 * Newest-first keyset paging over (created_at, id), or over `sort` and id. The cursor is a record id;
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
  const { table, id, scope } = source;
  const where = and(scope, filters);
  const forward = query.direction === 'forward';
  const inclusive = query.cursorMode === 'inclusive';

  let cursor = query.cursor;

  // Rows on the other side of the cursor: the page has a neighbour that way.
  let before = false;

  if (cursor) {
    const around = await aroundCursor(
      client,
      table,
      and(scope, eq(sql`${id}`, cursor)),
      and(where, walkOf(source, query, cursor).back),
    );

    if (!around.anchor) {
      // A list reopening at a remembered record that is gone starts from the top.
      if (!inclusive) {
        throw fail('INVALID_CURSOR', 'The cursor record no longer exists');
      }

      cursor = undefined;
    }

    before = around.before;
  }

  const walk = walkOf(source, query, cursor);

  // One after another: inside a request `client` is its transaction, a single connection.
  const rows = await fetch(and(where, walk.page), walk.order, query.limit + 1);

  const totals = await countRows(client, source, where, query);

  const more = rows.length > query.limit;
  const page = rows.slice(0, query.limit);

  if (!forward) {
    page.reverse();
  }

  return {
    data: page,
    pageInfo: {
      hasNextPage: forward ? more : before,
      hasPreviousPage: forward ? before : more,
      startCursor: page[0]?.id ?? null,
      endCursor: page[page.length - 1]?.id ?? null,
    },
    ...(totals && {
      totalCount: Math.min(totals[0]?.total ?? 0, source.countCap ?? Infinity),
      totalCapped: source.countCap !== undefined && (totals[0]?.total ?? 0) > source.countCap,
    }),
  };
};
