import { broadcasts, type Db, newId, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { inOrder, repeatWhile } from '~/lib/sequence';
import { logger } from '~/logger';
import {
  dropDeliveries,
  type EmailTry,
  queueDeliveries,
  settleTries,
} from '~/modules/email/deliveries';
import {
  AttachmentMissing,
  type FileAttachment,
  readAttachments,
} from '~/modules/email/attachments';
import { routeFor } from '~/modules/email/email';
import { sendingRoom } from '~/modules/email/ramp';
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
import { failForAttachment } from './attachments';
import { type RenderedCopy, renderCopy } from './render';

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

type Route = Awaited<ReturnType<typeof routeFor>>;

/** A recipient's copy, and its row in the delivery log when it is an email. */
interface Prepared {
  row: Claimed['rows'][number];
  copy: RenderedCopy | null;
  deliveryId: string | null;
}

/** Renders each copy; a deleted customer has none. */
const prepareBlock = (claimed: Claimed): Prepared[] =>
  claimed.rows.map((row) => {
    const values = claimed.values.get(row.customerId);
    const tracking = { origin: claimed.origin, recipientId: row.id };
    const copy = values ? renderCopy(claimed.broadcast, values, tracking) : null;

    return {
      row,
      copy,
      deliveryId: copy && claimed.broadcast.channel === 'email' ? newId() : null,
    };
  });

/**
 * Sends one copy; network only, no transaction. An email's try comes back for
 * the delivery log, its provider known once the route is.
 */
const sendCopy = async (
  claimed: Claimed,
  { row, copy, deliveryId }: Prepared,
  files: FileAttachment[],
): Promise<{ outcome: Outcome; tried?: EmailTry }> => {
  if (!copy) return { outcome: { status: 'failed', reason: 'The customer was deleted' } };

  const { broadcast } = claimed;
  let route: Route | null = null;

  try {
    if (!deliveryId) {
      await deliverSms(broadcast.orgId, { to: row.address, text: copy.text });
    } else {
      route = await routeFor(broadcast.orgId, broadcast.mailConnectionId);
      await route.send({
        to: row.address,
        subject: copy.subject ?? '',
        html: copy.html ?? '',
        text: copy.text,
        headers: copy.headers,
        fromName: broadcast.fromName ?? undefined,
        fromEmail: broadcast.fromEmail ?? undefined,
        files,
        replyTo: broadcast.replyTo ?? undefined,
        deliveryId,
      });
    }

    return {
      outcome: { status: 'sent' },
      tried: { provider: route?.provider ?? null, sent: true },
    };
  } catch (error) {
    const refused = outcomeOf(error);
    const provider = route?.provider ?? null;

    return {
      outcome: refused,
      tried:
        refused.status === 'failed'
          ? { provider, sent: false, error: refused.reason, final: true }
          : undefined,
    };
  }
};

/**
 * Sends the block in order; once the provider asks to slow down, the rest go
 * back unsent. An email's row is written before its try, so the provider's
 * events always find it; a copy sent back drops its row.
 */
const sendBlock = async (claimed: Claimed, files: FileAttachment[]) => {
  const prepared = prepareBlock(claimed);
  const outcomes = new Map<string, Outcome>();
  const tried: (EmailTry & { id: string })[] = [];
  const untried: string[] = [];
  let slowDown: string | null = null;

  // Enrolment left suppressed addresses out; one suppressed since (a bounce
  // meanwhile) is held back here, its row in the log saying so. Copies the
  // sending ramp holds go back to waiting, their rows dropped.
  const holds = await withOrg(claimed.broadcast.orgId, (tx) =>
    queueDeliveries(
      tx,
      {
        source: 'broadcast',
        sourceId: claimed.broadcast.id,
        connectionId: claimed.broadcast.mailConnectionId,
      },
      prepared.flatMap(({ row, copy, deliveryId }) =>
        copy && deliveryId
          ? [
              {
                id: deliveryId,
                to: row.address,
                customerId: row.customerId,
                subject: copy.subject ?? '',
              },
            ]
          : [],
      ),
    ),
  );

  await inOrder(prepared, async (item) => {
    const hold = item.deliveryId ? holds.get(item.deliveryId) : undefined;

    if (hold?.status === 'held' && item.deliveryId) {
      outcomes.set(item.row.id, {
        status: 'retry',
        reason: `Held by the sending limit (${hold.reason})`,
      });
      untried.push(item.deliveryId);

      return;
    }

    if (hold) {
      outcomes.set(item.row.id, {
        status: 'failed',
        reason: `The address is suppressed (${hold.reason})`,
      });

      return;
    }

    const copy = slowDown
      ? { outcome: { status: 'retry' as const, reason: slowDown } }
      : await sendCopy(claimed, item, files);

    if (copy.outcome.status === 'retry') slowDown = copy.outcome.reason;

    outcomes.set(item.row.id, copy.outcome);

    if (!item.deliveryId) return;

    if (copy.tried) tried.push({ id: item.deliveryId, ...copy.tried });
    else untried.push(item.deliveryId);
  });

  const paused = [...holds.values()].find((hold) => hold.status === 'held');

  return {
    outcomes,
    tried,
    untried,
    slowDown,
    pausedUntil: paused?.status === 'held' ? paused.until : null,
  };
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

/** How many copies the sending ramp lets an email broadcast take now; SMS isn't paced by it. */
const roomOf = async (tx: Db, broadcastId: string) => {
  const [broadcast] = await tx
    .select({ channel: broadcasts.channel })
    .from(broadcasts)
    .where(eq(broadcasts.id, broadcastId))
    .limit(1);

  return broadcast?.channel === 'email' ? sendingRoom(tx) : { room: Infinity, until: null };
};

/**
 * The broadcast's attached files, read once per run. A file deleted since fails
 * the broadcast (null): every copy would go out without it.
 */
const attachedFiles = async (orgId: string, broadcastId: string) => {
  const [broadcast] = await withOrg(orgId, (tx) =>
    tx
      .select({ attachmentIds: broadcasts.attachmentIds })
      .from(broadcasts)
      .where(eq(broadcasts.id, broadcastId))
      .limit(1),
  );

  try {
    return await readAttachments(orgId, broadcast?.attachmentIds ?? []);
  } catch (error) {
    if (!(error instanceof AttachmentMissing)) throw error;

    log.warn({ broadcastId, reason: error.message }, 'broadcast attachment deleted');
    await withOrg(orgId, (tx) => failForAttachment(tx, broadcastId, error.message));

    return null;
  }
};

/**
 * Sends a broadcast for up to a minute's allowance (`BROADCAST_PER_MINUTE`)
 * or `RUN_MS`, then hands over to the next run. Each block is claimed in one
 * short transaction and settled in another; the sending itself holds none.
 */
const deliverBroadcast = async (orgId: string, broadcastId: string) => {
  const files = await attachedFiles(orgId, broadcastId);

  if (!files) return;

  const started = Date.now();
  const allowance = config.broadcast.perMinute;
  let sent = 0;
  let slowDown: string | null = null;
  // The sending ramp's day is used or sending is halted: the next run waits for its window.
  const pause: { until: Date | null } = { until: null };

  // Each round sends at least one copy, so the allowance bounds the rounds.
  await repeatWhile(allowance, async () => {
    const claimed = await withOrg(orgId, async (tx) => {
      const { room, until } = await roomOf(tx, broadcastId);

      pause.until = until;

      return room > 0 ? claimBlock(tx, broadcastId, Math.min(BLOCK, allowance - sent, room)) : null;
    });

    if (!claimed?.rows.length) return false;

    const block = await sendBlock(claimed, files);

    pause.until = block.pausedUntil;

    await withOrg(orgId, async (tx) => {
      await settleBlock(tx, claimed, block.outcomes);
      await settleTries(tx, block.tried);
      await dropDeliveries(tx, block.untried);
    });

    sent += claimed.rows.length;
    slowDown = block.slowDown;

    return !slowDown && !pause.until && sent < allowance && Date.now() - started < RUN_MS;
  });

  const wait = pause.until
    ? pause.until.getTime() - Date.now()
    : slowDown
      ? SLOW_DOWN_MS
      : sent >= allowance
        ? started + 60_000 - Date.now()
        : 0;

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
