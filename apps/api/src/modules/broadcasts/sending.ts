import { broadcastRecipients, type Db, requestOrgId } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { assertComplete, assertReachable, getBroadcast, moveBroadcast } from './broadcasts.service';
import { queueDelivery } from './delivery';
import { queueStart } from './starting';

/**
 * Starts sending now. Checked before it moves: the content is complete and
 * somebody can be reached; the audience itself is frozen by the start job.
 */
export const sendBroadcast = async (tx: Db, id: string) => {
  const broadcast = await getBroadcast(tx, id);

  assertComplete(broadcast);
  await assertReachable(tx, broadcast);

  await moveBroadcast(tx, id, ['draft', 'scheduled'], {
    status: 'sending',
    startedAt: new Date(),
    scheduledAt: null,
    error: null,
  });
  await queueStart(tx, requestOrgId(), id);

  return getBroadcast(tx, id);
};

/** A moment at least a minute ahead, so the start can't be missed while it is saved. */
const assertFuture = (at: Date) => {
  if (at.getTime() < Date.now() + 60_000) {
    throw fail('INVALID_INPUT', 'Schedule it at least a minute ahead', {
      issues: [{ path: ['at'], message: 'must be at least a minute ahead' }],
    });
  }
};

/** Sends at `at`. Moving it again leaves the earlier start to find a different moment and do nothing. */
export const scheduleBroadcast = async (tx: Db, id: string, at: Date) => {
  assertFuture(at);
  assertComplete(await getBroadcast(tx, id));

  await moveBroadcast(tx, id, ['draft', 'scheduled'], {
    status: 'scheduled',
    scheduledAt: at,
    error: null,
  });
  await queueStart(tx, requestOrgId(), id, at);

  return getBroadcast(tx, id);
};

export const unscheduleBroadcast = async (tx: Db, id: string) => {
  await moveBroadcast(tx, id, ['scheduled'], { status: 'draft', scheduledAt: null });

  return getBroadcast(tx, id);
};

/** Copies already being sent finish; the next block isn't taken. */
export const pauseBroadcast = async (tx: Db, id: string) => {
  await moveBroadcast(tx, id, ['sending'], { status: 'paused' });

  return getBroadcast(tx, id);
};

/** Back to sending; a broadcast paused before its audience was frozen starts over. */
export const resumeBroadcast = async (tx: Db, id: string) => {
  await moveBroadcast(tx, id, ['paused'], { status: 'sending' });

  const broadcast = await getBroadcast(tx, id);

  if (broadcast.total) await queueDelivery(tx, requestOrgId(), id, `resume:${Date.now()}`);
  else await queueStart(tx, requestOrgId(), id);

  return broadcast;
};

/** Stops for good: recipients still waiting are skipped. */
export const cancelBroadcast = async (tx: Db, id: string) => {
  await moveBroadcast(tx, id, ['scheduled', 'sending', 'paused'], {
    status: 'cancelled',
    finishedAt: new Date(),
  });

  await tx
    .update(broadcastRecipients)
    .set({ status: 'skipped', reason: 'Cancelled', updatedAt: new Date() })
    .where(and(eq(broadcastRecipients.broadcastId, id), eq(broadcastRecipients.status, 'queued')));

  return getBroadcast(tx, id);
};
