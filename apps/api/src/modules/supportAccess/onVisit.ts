import { type Db, supportVisits, users } from '@erxes/core-db';
import { and, eq, exists, inArray, or, sql } from 'drizzle-orm';

/** A visit that still lets its support member in. */
export const visitInProgress = sql`${supportVisits.endedAt} is null and ${supportVisits.endsAt} > now()`;

/**
 * Members who may act now: everyone on the team, erxes support only while a visit lasts. Every
 * way a member acts (session, API key, app token, password sign-in) checks it, so the end of a
 * visit ends them all.
 */
export const actsNow = (client: Db) =>
  or(
    eq(users.isSupport, false),
    exists(
      client
        .select({ id: supportVisits.id })
        .from(supportVisits)
        .where(and(eq(supportVisits.userId, users.id), visitInProgress)),
    ),
  );

/** Ends the sessions and live streams of support members whose visit just ended. */
export const signOutSupport = async (client: Db, userIds: string[]) => {
  if (!userIds.length) return;

  await client
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: sql`now()` })
    .where(and(inArray(users.id, userIds), eq(users.isSupport, true)));
};
