import { type Db, emailDeliveries } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { suppressedOf } from './addresses';
import { onTimelines } from './deliveries';
import {
  admitEmails,
  countSent,
  isActive,
  isAuthSource,
  nextWindow,
  rampMode,
  rampOf,
} from './ramp';

/** What the email job does with its email now. */
export type SendDecision = { send: true } | { send: false; until: Date | null };

const SKIP: SendDecision = { send: false, until: null };

/**
 * The email job's check before it sends, in the organisation's transaction
 * (the row locked): an address suppressed since it was queued gets nothing,
 * its row says `suppressed`; a held email is let through when the ramp has
 * room, else waits for `until`; sending halted meanwhile holds any but a
 * sign-in or account email. A row already settled (a job run twice) is
 * skipped.
 */
export const decideAtSend = async (client: Db, deliveryId: string): Promise<SendDecision> => {
  const [row] = await client
    .select()
    .from(emailDeliveries)
    .where(eq(emailDeliveries.id, deliveryId))
    .limit(1)
    .for('update');

  if (!row) return { send: true };

  if (row.status !== 'queued' && row.status !== 'held') return SKIP;

  const [reason] = (await suppressedOf(client, [row.to], row.source === 'broadcast')).values();

  if (reason) {
    const [suppressed] = await client
      .update(emailDeliveries)
      .set({ status: 'suppressed', error: reason, updatedAt: new Date() })
      .where(eq(emailDeliveries.id, row.id))
      .returning();

    await onTimelines(client, suppressed ? [suppressed] : []);

    return SKIP;
  }

  if (row.status === 'held') {
    const hold = (await admitEmails(client, row.source, [row])).get(row.id);

    await client
      .update(emailDeliveries)
      .set(
        hold
          ? { status: hold.status, error: hold.reason, updatedAt: new Date() }
          : { status: 'queued', error: null, updatedAt: new Date() },
      )
      .where(eq(emailDeliveries.id, row.id));

    return hold?.status === 'held' ? { send: false, until: hold.until } : { send: true };
  }

  // A halt is Organization email's: a Mail service connection's emails go on.
  if (isAuthSource(row.source) || row.connectionId) return { send: true };

  const ramp = await rampOf(client);

  if (!ramp.haltedAt || !isActive(await rampMode(client), ramp)) return { send: true };

  await client
    .update(emailDeliveries)
    .set({ status: 'held', error: 'halted', updatedAt: new Date() })
    .where(eq(emailDeliveries.id, row.id));
  // Counted when it was queued; it counts again when the ramp lets it out.
  await countSent(client, -1);

  return { send: false, until: nextWindow(ramp) };
};
