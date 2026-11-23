import { broadcastRecipients, broadcasts, type Db, newId, suppressions } from '@erxes/core-db';
import { and, asc, eq, inArray, lt, notExists, or, sql } from 'drizzle-orm';
import { randomToken } from '~/lib/crypto';
import { appLink } from '~/modules/email/email';
import { organizationName, valuesOf } from './broadcasts.service';
import { publishSuppressed } from './lists';
import type { PlaceholderValues } from './placeholders';

/** Recipients one claim takes: how far past a pause a broadcast can go on. */
export const BLOCK = 50;

/** A claim lapses after this; a worker that died holding rows doesn't strand them. */
const LEASE = sql`interval '5 minutes'`;

/** A recipient claimed this often without an answer is given up on. */
const MAX_ATTEMPTS = 5;

/** What became of one copy. `retry`: the provider is busy, the row goes back unsent. */
export type Outcome =
  | { status: 'sent' }
  | { status: 'failed'; reason: string; bounced?: boolean }
  | { status: 'retry'; reason: string };

/** A block of recipients this worker holds, with what rendering their copies needs. */
export interface Claimed {
  broadcast: typeof broadcasts.$inferSelect;
  claim: string;
  rows: { id: string; customerId: string; address: string }[];
  values: Map<string, PlaceholderValues>;
  origin: string;
}

/** Queued rows, and rows whose claim lapsed. */
const takeable = (broadcastId: string) =>
  and(
    eq(broadcastRecipients.broadcastId, broadcastId),
    or(
      eq(broadcastRecipients.status, 'queued'),
      and(
        eq(broadcastRecipients.status, 'sending'),
        lt(broadcastRecipients.claimedUntil, sql`now()`),
      ),
    ),
  );

/** Gives up on rows claimed `MAX_ATTEMPTS` times whose last claim lapsed. */
const giveUpStale = (tx: Db, broadcastId: string) =>
  tx
    .update(broadcastRecipients)
    .set({
      status: 'failed',
      reason: `No answer after ${MAX_ATTEMPTS} attempts`,
      claim: null,
      claimedUntil: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(broadcastRecipients.broadcastId, broadcastId),
        eq(broadcastRecipients.status, 'sending'),
        lt(broadcastRecipients.claimedUntil, sql`now()`),
        sql`${broadcastRecipients.attempts} >= ${MAX_ATTEMPTS}`,
      ),
    );

/**
 * Takes the next block of recipients while the broadcast is sending. `skip
 * locked` keeps two workers off the same rows; the claim token is what lets
 * only this worker settle them.
 */
export const claimBlock = async (
  tx: Db,
  broadcastId: string,
  size: number,
): Promise<Claimed | null> => {
  const [broadcast] = await tx
    .select()
    .from(broadcasts)
    .where(and(eq(broadcasts.id, broadcastId), eq(broadcasts.status, 'sending')))
    .limit(1);

  if (!broadcast) return null;

  await giveUpStale(tx, broadcastId);

  const claim = randomToken(12);

  const rows = await tx
    .update(broadcastRecipients)
    .set({
      status: 'sending',
      claim,
      claimedUntil: sql`now() + ${LEASE}`,
      attempts: sql`${broadcastRecipients.attempts} + 1`,
      updatedAt: new Date(),
    })
    .where(
      inArray(
        broadcastRecipients.id,
        tx
          .select({ id: broadcastRecipients.id })
          .from(broadcastRecipients)
          .where(takeable(broadcastId))
          .orderBy(asc(broadcastRecipients.id))
          .limit(size)
          .for('update', { skipLocked: true }),
      ),
    )
    .returning({
      id: broadcastRecipients.id,
      customerId: broadcastRecipients.customerId,
      address: broadcastRecipients.address,
    });

  const organization = await organizationName(tx);
  const customerIds = rows.map((row) => row.customerId);

  return {
    broadcast,
    claim,
    rows,
    values: await valuesOf(tx, customerIds, organization),
    origin: await appLink(tx, ''),
  };
};

/**
 * Writes what became of the block, only where this worker's claim still holds
 * the row (a lapsed claim taken by another worker is theirs now). A row sent
 * back unsent doesn't count as an attempt; a bounced address is suppressed.
 */
export const settleBlock = async (tx: Db, claimed: Claimed, outcomes: Map<string, Outcome>) => {
  const results = [...outcomes].map(([id, outcome]) => ({
    id,
    status: outcome.status === 'retry' ? 'queued' : outcome.status,
    reason: outcome.status === 'sent' ? null : outcome.reason,
  }));

  if (results.length) {
    await tx.execute(sql`
      update ${broadcastRecipients} r set
        status = v.status,
        reason = v.reason,
        sent_at = case when v.status = 'sent' then now() else r.sent_at end,
        attempts = case when v.status = 'queued' then r.attempts - 1 else r.attempts end,
        claim = null,
        claimed_until = null,
        updated_at = now()
      from jsonb_to_recordset(${JSON.stringify(results)}::jsonb) as v(id text, status text, reason text)
      where r.id = v.id and r.claim = ${claimed.claim}`);
  }

  const bounced = claimed.rows.flatMap((row) => {
    const outcome = outcomes.get(row.id);

    return outcome?.status === 'failed' && outcome.bounced
      ? [{ address: row.address, detail: outcome.reason, customerId: row.customerId }]
      : [];
  });

  if (bounced.length) {
    const added = await tx
      .insert(suppressions)
      .values(
        bounced.map(({ address, detail }) => ({
          id: newId(),
          channel: claimed.broadcast.channel,
          address,
          reason: 'bounced' as const,
          detail,
          broadcastId: claimed.broadcast.id,
        })),
      )
      .onConflictDoNothing()
      .returning();

    await publishSuppressed(
      tx,
      added.map((row) => ({
        row,
        customerId: bounced.find(({ address }) => address === row.address)?.customerId ?? null,
      })),
    );
  }
};

/** Recipients still to take now: queued, or claimed by a worker whose lease lapsed. */
export const hasWaiting = async (tx: Db, broadcastId: string) =>
  (
    await tx
      .select({ id: broadcastRecipients.id })
      .from(broadcastRecipients)
      .where(takeable(broadcastId))
      .limit(1)
  ).length > 0;

/** Done when no recipient is waiting or being sent. Once: a conditional update. */
export const finishIfDone = (tx: Db, broadcastId: string) =>
  tx
    .update(broadcasts)
    .set({ status: 'sent', finishedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(broadcasts.id, broadcastId),
        eq(broadcasts.status, 'sending'),
        notExists(
          tx
            .select({ id: broadcastRecipients.id })
            .from(broadcastRecipients)
            .where(
              and(
                eq(broadcastRecipients.broadcastId, broadcastId),
                or(
                  eq(broadcastRecipients.status, 'queued'),
                  eq(broadcastRecipients.status, 'sending'),
                ),
              ),
            ),
        ),
      ),
    );
