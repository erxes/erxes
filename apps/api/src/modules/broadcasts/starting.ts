import { broadcastRecipients, broadcasts, type Db, withSystem } from '@erxes/core-db';
import { and, eq, gt, lt, notExists, sql } from 'drizzle-orm';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { isVerifiedReplyTo } from '~/modules/email/replyTos.service';
import { defineJob, defineSchedule } from '~/modules/jobs/jobs';
import { enrolAudience } from './audience';
import { missingContent, outerId } from './broadcasts.service';
import { deliverJob, queueDelivery } from './delivery';

const log = logger.child({ component: 'broadcasts' });

const failBroadcast = (tx: Db, broadcastId: string, error: string) =>
  tx
    .update(broadcasts)
    .set({ status: 'failed', error, finishedAt: new Date(), updatedAt: new Date() })
    .where(eq(broadcasts.id, broadcastId));

const StartPayload = z.object({
  broadcastId: z.string(),
  /** A scheduled start: the moment it was set for, so a moved or cancelled schedule doesn't fire. */
  scheduledAt: z.string().optional(),
});

/**
 * Freezes the audience and queues delivery. A scheduled start first moves the
 * broadcast to sending, if it still waits for this moment and is complete.
 */
const startJob = defineJob({
  queue: 'broadcast.start',
  atomic: true,
  timeoutSeconds: 900,
  retry: { attempts: 3, delay: 60, maxDelay: 300 },
  payload: StartPayload,
  async handle(job, tx) {
    const { broadcastId, scheduledAt } = job.payload;

    const [broadcast] = await tx
      .select()
      .from(broadcasts)
      .where(eq(broadcasts.id, broadcastId))
      .for('update')
      .limit(1);

    if (!broadcast) return;

    if (scheduledAt) {
      if (
        broadcast.status !== 'scheduled' ||
        broadcast.scheduledAt?.toISOString() !== scheduledAt
      ) {
        return;
      }

      const missing = missingContent(broadcast);

      if (missing.length) {
        await failBroadcast(
          tx,
          broadcastId,
          `It had no ${missing.join(' and ')} when its time came`,
        );

        return;
      }

      if (broadcast.replyTo && !(await isVerifiedReplyTo(tx, broadcast.replyTo))) {
        await failBroadcast(
          tx,
          broadcastId,
          `Its Reply-To ${broadcast.replyTo} was no longer verified when its time came`,
        );

        return;
      }

      await tx
        .update(broadcasts)
        .set({ status: 'sending', startedAt: new Date(), updatedAt: new Date() })
        .where(eq(broadcasts.id, broadcastId));
    } else if (broadcast.status !== 'sending' || broadcast.total > 0) {
      return;
    }

    const total = await enrolAudience(tx, broadcast);

    if (!total) {
      await failBroadcast(tx, broadcastId, 'Nobody in the audience could be reached');

      return;
    }

    await tx.update(broadcasts).set({ total }).where(eq(broadcasts.id, broadcastId));
    await queueDelivery(tx, job.orgId, broadcastId, 'start');
  },
});

/** Queues the start in the caller's transaction: now, or at the scheduled moment. */
export const queueStart = (tx: Db, orgId: string, broadcastId: string, scheduledAt?: Date) =>
  startJob.enqueue(tx, {
    orgId,
    payload: { broadcastId, scheduledAt: scheduledAt?.toISOString() },
    runAt: scheduledAt,
    dedupeKey: `broadcast-start:${broadcastId}:${scheduledAt?.toISOString() ?? 'now'}`,
  });

/** No recipient touched for this long while sending: its work was lost. */
const QUIET = sql`now() - interval '10 minutes'`;

/**
 * Picks up broadcasts whose work was lost: a start that never froze the
 * audience, or a delivery chain that stopped (a job given up after its last
 * retry). Claims make a second worker harmless, so this errs toward acting.
 */
const sweep = () =>
  withSystem('broadcasts: resume lost sending', async (tx) => {
    const stuck = await tx
      .select({ orgId: broadcasts.orgId, id: broadcasts.id, total: broadcasts.total })
      .from(broadcasts)
      .where(
        and(
          eq(broadcasts.status, 'sending'),
          lt(broadcasts.updatedAt, QUIET),
          notExists(
            tx
              .select({ id: broadcastRecipients.id })
              .from(broadcastRecipients)
              .where(
                and(
                  eq(broadcastRecipients.broadcastId, outerId),
                  gt(broadcastRecipients.updatedAt, QUIET),
                ),
              ),
          ),
        ),
      )
      .limit(500);

    const bucket = Math.floor(Date.now() / 600_000);

    await inOrder(stuck, (broadcast) =>
      broadcast.total
        ? queueDelivery(tx, broadcast.orgId, broadcast.id, `sweep:${bucket}`)
        : startJob.enqueue(tx, {
            orgId: broadcast.orgId,
            payload: { broadcastId: broadcast.id },
            dedupeKey: `broadcast-start:${broadcast.id}:sweep:${bucket}`,
          }),
    );

    if (stuck.length) {
      log.warn({ broadcasts: stuck.map(({ id }) => id) }, 'resumed lost broadcasts');
    }
  });

const broadcastSweep = defineSchedule({
  queue: 'broadcast.sweep',
  cron: '*/5 * * * *',
  run: sweep,
});

export const BROADCAST_JOBS = [startJob, deliverJob, broadcastSweep];
