import { FAVORITES_MAX } from '@erxes/core-contract';
import { caller, type Db, favorites, newId, requestOrgId } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { oneRow } from '~/lib/rows';

/** Only the signed-in member's own favorites exist for them. */
const mine = () => eq(favorites.userId, caller('user').userId);

const listed = (client: Db) =>
  wholeList((limit) =>
    client
      .select()
      .from(favorites)
      .where(mine())
      .orderBy(asc(favorites.position), asc(favorites.createdAt))
      .limit(limit),
  );

export const listFavorites = async (client: Db) => ({ data: await listed(client) });

/**
 * Stars a page at the end of the list. Starring it again keeps its place and
 * takes the new label. A member's adds take turns, so two at once can't pass
 * the limit or take the same place.
 */
export const addFavorite = async (client: Db, input: { path: string; label: string }) => {
  const { userId } = caller('user');

  await lockKeys(client, [`favorites:${requestOrgId()}:${userId}`]);

  const [stats] = await client
    .select({
      held: sql<number>`count(*)::int`,
      starred: sql<boolean>`bool_or(${favorites.path} = ${input.path})`,
      last: sql<number>`coalesce(max(${favorites.position}), 0)::int`,
    })
    .from(favorites)
    .where(mine());

  if (!stats?.starred && (stats?.held ?? 0) >= FAVORITES_MAX) {
    throw fail(
      'FAVORITE_LIMIT',
      `You can keep ${FAVORITES_MAX} favorites. Remove one you don't use first.`,
    );
  }

  return oneRow(
    await client
      .insert(favorites)
      .values({ id: newId(), userId, ...input, position: (stats?.last ?? 0) + 1 })
      .onConflictDoUpdate({
        target: [favorites.orgId, favorites.userId, favorites.path],
        set: { label: input.label },
      })
      .returning(),
  );
};

export const renameFavorite = async (client: Db, id: string, label: string) => {
  const [row] = await client
    .update(favorites)
    .set({ label })
    .where(and(eq(favorites.id, id), mine()))
    .returning();

  if (!row) throw notFound('Favorite');

  return row;
};

export const removeFavorite = async (client: Db, id: string) => {
  const [row] = await client
    .delete(favorites)
    .where(and(eq(favorites.id, id), mine()))
    .returning({ id: favorites.id });

  if (!row) throw notFound('Favorite');

  return { ok: true as const };
};

/**
 * Numbers the member's favorites 1, 2, … in the given order, in one update;
 * ones not named follow in their current order, and unknown ids are skipped.
 */
export const reorderFavorites = async (client: Db, ids: string[]) => {
  const order = sql`array[${sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  )}]::text[]`;

  const ranked = client.$with('ranked').as(
    client
      .select({
        id: favorites.id,
        rank: sql<number>`row_number() over (order by array_position(${order}, ${favorites.id}) nulls last, ${favorites.position}, ${favorites.createdAt})::int`.as(
          'rank',
        ),
      })
      .from(favorites)
      .where(mine()),
  );

  await client
    .with(ranked)
    .update(favorites)
    .set({ position: sql`${ranked.rank}` })
    .from(ranked)
    .where(eq(favorites.id, ranked.id));

  return { data: await listed(client) };
};
