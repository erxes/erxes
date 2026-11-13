import type { Db, fieldGroups, fields, leadStages } from '@erxes/core-db';
import { inArray, sql } from 'drizzle-orm';

/**
 * The row an insert's or update's `returning()` gave back. Callers have
 * already checked the row exists, so a missing one is a bug, not a client error.
 */
export const oneRow = <T>(rows: T[]) => {
  const [row] = rows;

  if (row === undefined) throw new Error('Expected the statement to return a row');

  return row;
};

/** Gives each row its `order`, in one update (`case id when … then … end`). */
export const setOrders = async (
  client: Db,
  table: typeof fields | typeof fieldGroups | typeof leadStages,
  orders: { id: string; order: number }[],
) => {
  // An id listed twice gets its last order, as one update per item gave it.
  const orderOf = new Map(orders.map(({ id, order }) => [id, order]));

  if (orderOf.size) {
    await client
      .update(table)
      .set({
        order: sql`case ${sql.join(
          Array.from(orderOf, ([id, order]) => sql`when ${table.id} = ${id} then ${order}::int`),
          sql` `,
        )} end`,
        updatedAt: sql`now()`,
      })
      .where(inArray(table.id, Array.from(orderOf.keys())));
  }

  return { ok: true as const };
};
