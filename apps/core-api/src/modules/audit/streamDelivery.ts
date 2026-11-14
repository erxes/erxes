import {
  auditLogs,
  auditStreams,
  type Db,
  organizations,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, asc, eq, exists, gt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { repeatWhile } from '~/lib/sequence';
import { describeError, defineJob, defineSchedule } from '~/modules/jobs/jobs';
import { logger } from '~/logger';
import { postOutbound } from '~/lib/outbound';
import { unseal } from '~/lib/secrets';
import { signPayload } from '~/modules/webhooks/webhookDelivery';
import { securityAlert } from './alerts';
import { formatBatch, streamEntry } from './streamFormat';

const log = logger.child({ component: 'audit-streams' });

type StreamRow = typeof auditStreams.$inferSelect;

/** Entries per request; a full batch is followed by the next at once. */
const BATCH = 200;

/** Owners hear about a stream failing this many times in a row. */
const ALERT_AFTER_FAILURES = 10;

export const organizationOf = async (client: Db, orgId: string) => {
  const [org] = await client
    .select({ id: organizations.id, subdomain: organizations.subdomain })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  return org ?? { id: orgId, subdomain: orgId };
};

/** POSTs a batch to the stream's endpoint, signed; outside any transaction. */
export const sendBatch = async (row: StreamRow, body: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'erxes-audit-stream/1',
    'Erxes-Stream-Id': row.id,
    'Erxes-Signature': signPayload(unseal(row.secretSealed), body),
  };

  if (row.authHeaderName && row.authHeaderValueSealed)
    headers[row.authHeaderName] = unseal(row.authHeaderValueSealed);

  // A refused or unreachable endpoint is the answer this returns, not an error.
  const response = await postOutbound(row.url, body, headers, 10_000).catch((error: unknown) => ({
    error: describeError(error).slice(0, 500),
  }));

  if ('error' in response) {
    return { ok: false, status: null, body: null, error: response.error, ms: null };
  }

  const ok = response.status >= 200 && response.status < 300;

  return {
    ok,
    status: response.status,
    body: response.body,
    error: ok ? null : `HTTP ${response.status}`,
    ms: response.ms,
  };
};

/** The stream's next batch after its cursor, in chain order, or null when it is removed or paused. */
const nextBatch = (orgId: string, streamId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx
      .select()
      .from(auditStreams)
      .where(eq(auditStreams.id, streamId))
      .limit(1);

    if (!row || row.status !== 'active') return null;

    const entries = await tx
      .select()
      .from(auditLogs)
      .where(gt(auditLogs.chainSeq, row.cursorSeq))
      .orderBy(asc(auditLogs.chainSeq))
      .limit(BATCH);

    return { row, entries, organization: await organizationOf(tx, orgId) };
  });

/**
 * Sends the next batch: read in one short transaction, sent after it. The
 * cursor moves only when the endpoint answers 2xx and the stream is still
 * where this batch read it. True when a full batch went out (more may wait);
 * a refusal throws, after counting it and telling owners when it keeps failing.
 */
const sendNextBatch = async (orgId: string, streamId: string) => {
  const batch = await nextBatch(orgId, streamId);
  const first = batch?.entries.at(0);
  const last = batch?.entries.at(-1);

  if (!batch || !first || !last) return false;

  const { row, entries } = batch;
  const firstSeq = first.chainSeq ?? row.cursorSeq + 1;

  const gap =
    firstSeq > row.cursorSeq + 1 ? { fromSeq: row.cursorSeq + 1, toSeq: firstSeq - 1 } : null;

  const body = formatBatch(
    row.format,
    { streamId, organization: batch.organization },
    entries.map(streamEntry),
    gap,
  );

  const result = await sendBatch(row, body);

  // Only from where this batch read: a stream paused, moved or re-pointed meanwhile is left
  // alone (a batch the old URL took is sent again to the new one).
  const unchanged = and(
    eq(auditStreams.id, streamId),
    eq(auditStreams.status, 'active'),
    eq(auditStreams.cursorSeq, row.cursorSeq),
    eq(auditStreams.url, row.url),
  );

  if (result.ok) {
    const moved = await withOrg(orgId, (tx) =>
      tx
        .update(auditStreams)
        .set({
          cursorSeq: last.chainSeq ?? row.cursorSeq,
          lastDeliveredAt: sql`now()`,
          lastError: null,
          consecutiveFailures: 0,
        })
        .where(unchanged)
        .returning({ id: auditStreams.id }),
    );

    return moved.length > 0 && entries.length === BATCH;
  }

  await withOrg(orgId, async (tx) => {
    const [failed] = await tx
      .update(auditStreams)
      .set({
        lastError: result.error,
        consecutiveFailures: sql`${auditStreams.consecutiveFailures} + 1`,
      })
      .where(unchanged)
      .returning({ failures: auditStreams.consecutiveFailures });

    if (failed?.failures === ALERT_AFTER_FAILURES) {
      await securityAlert(tx, orgId, {
        key: `audit-stream-failing:${streamId}`,
        title: `The audit log can't reach ${row.name}`,
        body: `${failed.failures} tries in a row failed (${result.error}). Entries wait and are sent once it answers again.`,
        link: '/settings/audit-log',
        email: true,
      }).catch((error: unknown) =>
        log.warn({ err: error, streamId }, 'could not tell owners about a failing audit stream'),
      );
    }
  });

  throw new Error(result.error ?? 'the endpoint refused the batch');
};

/**
 * One round of a stream: batches until it is caught up. A refusal fails the
 * round, and pg-boss retries it: 20 s, 40 s, 80 s … at most 15 minutes
 * apart; nothing is skipped. One round per stream is queued or running at a
 * time (the stream id is the dedupe key).
 */
export const auditStreamJob = defineJob({
  queue: 'audit.stream',
  timeoutSeconds: 300,
  retry: { attempts: 6, delay: 20, maxDelay: 900 },
  payload: z.object({ streamId: z.string() }),
  async handle(job) {
    await repeatWhile(50, () => sendNextBatch(job.orgId, job.payload.streamId));
  },
});

/** Sends a stream's waiting entries now (a new, resumed or re-pointed stream), even a round backing off. */
export const queueStreamRound = (client: Db, row: Pick<StreamRow, 'id' | 'orgId'>) =>
  auditStreamJob.enqueueNow(client, {
    orgId: row.orgId,
    payload: { streamId: row.id },
    dedupeKey: row.id,
  });

/** Every minute, a round for each active stream with entries past its cursor. */
export const auditStreamsSchedule = defineSchedule({
  queue: 'audit.streams',
  cron: '* * * * *',
  run: () =>
    withSystem('audit streams', async (tx) => {
      const behind = await tx
        .select({ id: auditStreams.id, orgId: auditStreams.orgId })
        .from(auditStreams)
        .where(
          and(
            eq(auditStreams.status, 'active'),
            exists(
              tx
                .select({ one: sql`1` })
                .from(auditLogs)
                .where(
                  and(
                    eq(auditLogs.orgId, auditStreams.orgId),
                    gt(auditLogs.chainSeq, auditStreams.cursorSeq),
                  ),
                ),
            ),
          ),
        );

      await auditStreamJob.enqueueAll(
        tx,
        behind.map((row) => ({
          orgId: row.orgId,
          payload: { streamId: row.id },
          dedupeKey: row.id,
        })),
      );
    }),
});
