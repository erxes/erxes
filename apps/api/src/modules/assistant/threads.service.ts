import type { CursorQuery } from '@erxes/core-contract';
import { assistantMessages, assistantThreads, caller, type Db } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';

type ThreadRow = typeof assistantThreads.$inferSelect;

const RUN_STALE_MS = 15 * 60_000;

export const isRunning = (row: Pick<ThreadRow, 'runningSince'>, now = Date.now()) =>
  row.runningSince !== null && now - row.runningSince.getTime() < RUN_STALE_MS;

const present = (row: ThreadRow) => ({ ...row, running: isRunning(row) });

export const ownThread = () => eq(assistantThreads.userId, caller('user').userId);

const findThread = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(assistantThreads)
    .where(and(ownThread(), eq(assistantThreads.id, id)))
    .limit(1);

  if (!row) throw notFound('Thread');

  return row;
};

export const listThreads = async (client: Db, query: CursorQuery & { pinned?: boolean }) => {
  const page = await keysetPage(
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

  return { ...page, data: page.data.map(present) };
};

export const threadMessages = (client: Db, threadId: string) =>
  client
    .select()
    .from(assistantMessages)
    .where(eq(assistantMessages.threadId, threadId))
    .orderBy(asc(assistantMessages.position));

export const getThread = async (client: Db, id: string) => {
  const thread = await findThread(client, id);

  return { ...present(thread), messages: await threadMessages(client, id) };
};

export const updateThread = async (
  client: Db,
  id: string,
  changes: { title?: string; pinned?: boolean },
) => {
  await findThread(client, id);

  const [row] = await client
    .update(assistantThreads)
    .set({ ...changes, updatedAt: sql`now()` })
    .where(and(ownThread(), eq(assistantThreads.id, id)))
    .returning();

  if (!row) throw notFound('Thread');

  return present(row);
};

export const removeThread = async (client: Db, id: string) => {
  const removed = await client
    .delete(assistantThreads)
    .where(and(ownThread(), eq(assistantThreads.id, id)))
    .returning({ id: assistantThreads.id });

  if (!removed.length) throw notFound('Thread');

  return { ok: true as const };
};
