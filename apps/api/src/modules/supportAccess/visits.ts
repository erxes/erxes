import type { CursorQuery } from '@erxes/core-contract';
import { caller, type Db, organizations, supportVisits } from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';

/** A visit that still lets its support member in. */
export const visitInProgress = sql`${supportVisits.endedAt} is null and ${supportVisits.endsAt} > now()`;

/** The most visits in progress at once that `active` lists (one per erxes.io admin). */
const ACTIVE_MAX = 50;

/** erxes support can come in: SaaS, with erxes.io's keys. */
export const supportAvailable = () => config.saas.enabled && config.saas.supportKeys.length > 0;

/** Whether erxes support may enter (on unless an owner turned it off). */
export const supportAccessSettings = async (client: Db) => {
  const [row] = await client
    .select({ settings: organizations.settings })
    .from(organizations)
    .limit(1);

  return {
    enabled: row?.settings.supportAccess?.enabled ?? true,
    available: supportAvailable(),
  };
};

export const updateSupportAccess = async (client: Db, input: { enabled: boolean }) => {
  const before = await supportAccessSettings(client);

  const organization = oneRow(
    await client
      .update(organizations)
      .set({
        settings: sql`jsonb_set(${organizations.settings}, '{supportAccess}', ${JSON.stringify({ enabled: input.enabled })}::jsonb)`,
        updatedAt: sql`now()`,
      })
      .returning({ id: organizations.id }),
  );

  // Off keeps everyone out, including whoever is in now.
  if (!input.enabled) {
    await client
      .update(supportVisits)
      .set({ endedAt: sql`now()`, endedBy: caller('user').userId })
      .where(visitInProgress);
  }

  await recordAudit(client, {
    action: 'settings.support_access_changed',
    targetType: 'organization',
    targetId: organization.id,
    changes: { enabled: [before.enabled, input.enabled] },
  });

  return supportAccessSettings(client);
};

export const listVisits = (client: Db, query: CursorQuery) =>
  keysetPage(
    client,
    { table: supportVisits, id: supportVisits.id, createdAt: supportVisits.startedAt },
    undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(supportVisits)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

/** The banner's visits: every one in progress for owners, erxes support's own, none for others. */
export const activeVisits = async (client: Db) => {
  const me = caller('user');

  if (me.role !== 'owner') return { data: [] };

  const rows = await client
    .select()
    .from(supportVisits)
    .where(me.support ? and(eq(supportVisits.userId, me.userId), visitInProgress) : visitInProgress)
    .orderBy(desc(supportVisits.startedAt))
    .limit(ACTIVE_MAX);

  return { data: rows };
};

/** An owner signs erxes support out now. */
export const endVisit = async (client: Db, id: string) => {
  const [visit] = await client
    .update(supportVisits)
    .set({ endedAt: sql`now()`, endedBy: caller('user').userId })
    .where(and(eq(supportVisits.id, id), visitInProgress))
    .returning();

  if (!visit) throw notFound('Support visit in progress');

  return visit;
};
