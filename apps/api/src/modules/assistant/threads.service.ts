import type { CursorQuery } from '@erxes/core-contract';
import { assistantThreads, caller, type Db } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';

export const ownThread = () => eq(assistantThreads.userId, caller('user').userId);

export const findThread = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(assistantThreads)
    .where(and(ownThread(), eq(assistantThreads.id, id)))
    .limit(1);

  if (!row) throw notFound('Thread');

  return row;
};

export const listThreads = (client: Db, query: CursorQuery & { pinned?: boolean }) =>
  keysetPage(
    client,
    {
      table: assistantThreads,
      id: assistantThreads.id,
      createdAt: assistantThreads.updatedAt,
      scope: ownThread(),
    },
    query.pinned === undefined ? undefined : eq(assistantThreads.pinned, query.pinned),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(assistantThreads)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

export const updateThread = async (
  client: Db,
  id: string,
  changes: { title?: string; pinned?: boolean },
) => {
  const [row] = await client
    .update(assistantThreads)
    .set({ ...changes, updatedAt: sql`now()` })
    .where(and(ownThread(), eq(assistantThreads.id, id)))
    .returning();

  if (!row) throw notFound('Thread');

  return row;
};

export const removeThread = async (client: Db, id: string) => {
  const removed = await client
    .delete(assistantThreads)
    .where(and(ownThread(), eq(assistantThreads.id, id)))
    .returning({ id: assistantThreads.id });

  if (!removed.length) throw notFound('Thread');

  return { ok: true as const };
};
