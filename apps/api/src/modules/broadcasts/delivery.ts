import { broadcasts, type Db, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { inOrder, repeatWhile } from '~/lib/sequence';
import { logger } from '~/logger';
import { deliverEmail } from '~/modules/email/email';
import { defineJob, describeError } from '~/modules/jobs/jobs';
import { deliverSms } from '~/modules/sms/sms';
import {
  BLOCK,
  type Claimed,
  claimBlock,
  finishIfDone,
  hasWaiting,
  type Outcome,
  settleBlock,
} from './claims';
import { renderCopy } from './render';

const log = logger.child({ component: 'broadcasts' });

/** How long one delivery job sends before it hands over to the next. */
const RUN_MS = 50_000;

/** How long to wait when the provider asks to slow down. */
const SLOW_DOWN_MS = 2 * 60_000;

const Refusal = z.object({ responseCode: z.number().optional(), code: z.string().optional() });

const TEMPORARY_CODES = ['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS', 'ECONNRESET'];

/** No such mailbox (550), not accepted for that address (551, 553): the address is suppressed. */
const BOUNCE_CODES = [550, 551, 553];

/** A refusal says whether to try later (4xx, network), stop for this address (550 …), or give up on the copy. */
const outcomeOf = (error: unknown): Outcome => {
  const reason = describeError(error).slice(0, 500);
  const { responseCode, code } = Refusal.safeParse(error).data ?? {};

  if ((responseCode && responseCode < 500) || TEMPORARY_CODES.includes(code ?? '')) {
    return { status: 'retry', reason };
  }

  return {
    status: 'failed',
    reason,
    bounced: responseCode !== undefined && BOUNCE_CODES.includes(responseCode),
  };
};

/** Sends one copy; network only, no transaction. */
const sendCopy = async (claimed: Claimed, row: Claimed['rows'][number]): Promise<Outcome> => {
  const values = claimed.values.get(row.customerId);

  if (!values) return { status: 'failed', reason: 'The customer was deleted' };

  const { broadcast } = claimed;
  const copy = renderCopy(broadcast, values, { origin: claimed.origin, recipientId: row.id });

  try {
    if (broadcast.channel === 'sms') {
      await deliverSms({ to: row.address, text: copy.text });
    } else {
      await deliverEmail(
        {
          to: row.address,
          subject: copy.subject ?? '',
          html: copy.html ?? '',
          text: copy.text,
          headers: copy.headers,
          fromName: broadcast.fromName ?? undefined,
          replyTo: broadcast.replyTo ?? undefined,
          sender: claimed.sender,
        },
        broadcast.orgId,
      );
    }

    return { status: 'sent' };
  } catch (error) {
    return outcomeOf(error);
  }
};

/** Sends the block in order; once the provider asks to slow down, the rest go back unsent. */
const sendBlock = async (claimed: Claimed) => {
  const outcomes = new Map<string, Outcome>();
  let slowDown: string | null = null;

  await inOrder(claimed.rows, async (row) => {
    if (slowDown) {
      outcomes.set(row.id, { status: 'retry', reason: slowDown });

      return;
    }

    const outcome = await sendCopy(claimed, row);

    if (outcome.status === 'retry') slowDown = outcome.reason;

    outcomes.set(row.id, outcome);
  });

  return { outcomes, slowDown };
};

/** Finishes the broadcast, or queues its next run: now, after the minute, or after a slow-down. */
const continueOrFinish = async (
  tx: Db,
  orgId: string,
  broadcastId: string,
  next: { wait: number; slowDown: string | null },
) => {
  if (!(await hasWaiting(tx, broadcastId))) {
    await finishIfDone(tx, broadcastId);

    return;
  }

  const [broadcast] = await tx
    .select({ status: broadcasts.status })
    .from(broadcasts)
    .where(eq(broadcasts.id, broadcastId))
    .limit(1);

  if (broadcast?.status !== 'sending') return;

  if (next.slowDown)
    log.warn({ broadcastId, reason: next.slowDown }, 'provider asked to slow down');

  const runAt = new Date(Date.now() + Math.max(next.wait, 0));

  await deliverJob.enqueue(tx, {
    orgId,
    payload: { broadcastId },
    runAt,
    dedupeKey: `broadcast-deliver:${broadcastId}:${runAt.getTime()}`,
  });
};

/**
 * Sends a broadcast for up to a minute's allowance (`BROADCAST_PER_MINUTE`)
 * or `RUN_MS`, then hands over to the next run. Each block is claimed in one
 * short transaction and settled in another; the sending itself holds none.
 */
const deliverBroadcast = async (orgId: string, broadcastId: string) => {
  const started = Date.now();
  const allowance = config.broadcast.perMinute;
  let sent = 0;
  let slowDown: string | null = null;

  // Each round sends at least one copy, so the allowance bounds the rounds.
  await repeatWhile(allowance, async () => {
    const claimed = await withOrg(orgId, (tx) =>
      claimBlock(tx, broadcastId, Math.min(BLOCK, allowance - sent)),
    );

    if (!claimed?.rows.length) return false;

    const block = await sendBlock(claimed);

    await withOrg(orgId, (tx) => settleBlock(tx, claimed, block.outcomes));

    sent += claimed.rows.length;
    slowDown = block.slowDown;

    return !slowDown && sent < allowance && Date.now() - started < RUN_MS;
  });

  const wait = slowDown ? SLOW_DOWN_MS : sent >= allowance ? started + 60_000 - Date.now() : 0;

  await withOrg(orgId, (tx) => continueOrFinish(tx, orgId, broadcastId, { wait, slowDown }));
};

export const deliverJob = defineJob({
  queue: 'broadcast.deliver',
  timeoutSeconds: 300,
  retry: { attempts: 5, delay: 30, maxDelay: 600 },
  concurrency: 4,
  payload: z.object({ broadcastId: z.string() }),
  handle: (job) => deliverBroadcast(job.orgId, job.payload.broadcastId),
});

/** Queues a delivery run now, in the caller's transaction. */
export const queueDelivery = (tx: Db, orgId: string, broadcastId: string, reason: string) =>
  deliverJob.enqueue(tx, {
    orgId,
    payload: { broadcastId },
    dedupeKey: `broadcast-deliver:${broadcastId}:${reason}`,
  });
