import type { CursorQuery } from '@erxes/core-contract';
import { type SQL, sql } from 'drizzle-orm';

/**
 * Keyset paging in any order: (sort value, id), records without a value last. The cursor is a
 * record id; the page reads its sort value from the table, so values keep full precision.
 */

export interface SortedSource {
  /** The rows' id, and what the anchor's sort value is read from. */
  id: SQL;
  from: SQL;
  /** The sort expression over a row. */
  sort: SQL;
  descending: boolean;
}

/** Rows on the far side of the anchor, the way the page walks: `walk` is its comparison. */
const beyond = (source: SortedSource, anchor: string, walk: '<' | '>', nullsAhead: boolean) => {
  const { id, sort, from } = source;
  const op = sql.raw(walk);
  const value = sql`(select ${sort} from ${from} where ${id} = ${anchor})`;
  const tie = sql`(${sort} = ${value} and ${id} ${op} ${anchor})`;

  // Records without a value sit after those with one walking forward, before them walking back.
  return nullsAhead
    ? sql`(case when ${value} is null then (${sort} is null and ${id} ${op} ${anchor}) else (${sort} ${op} ${value} or ${tie} or ${sort} is null) end)`
    : sql`(case when ${value} is null then (${sort} is not null or ${id} ${op} ${anchor}) else (${sort} ${op} ${value} or ${tie}) end)`;
};

/**
 * A page's order, the condition for its rows past `cursor` (`page`), and the one for rows on
 * the other side (`back`, whether there is a page before). Backward walks the list's order
 * the other way: the caller turns its page round.
 */
export const sortedWalk = (source: SortedSource, query: CursorQuery, cursor?: string) => {
  const forward = query.direction === 'forward';
  const ahead = forward === source.descending ? '<' : '>';
  const walk = forward ? ahead : ahead === '<' ? '>' : '<';
  const direction = sql.raw(walk === '<' ? 'desc' : 'asc');
  const nulls = sql.raw(forward ? 'nulls last' : 'nulls first');
  const order = [sql`${source.sort} ${direction} ${nulls}`, sql`${source.id} ${direction}`];

  if (!cursor) return { order, page: undefined, back: undefined };

  const page = beyond(source, cursor, walk, forward);

  return {
    order,
    page: query.cursorMode === 'inclusive' ? sql`(${page} or ${source.id} = ${cursor})` : page,
    back: beyond(source, cursor, walk === '<' ? '>' : '<', !forward),
  };
};
