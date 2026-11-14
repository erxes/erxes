import { auditLogs, auditStreams, type Db, newId, organizations, withOrg } from '@erxes/core-db';
import { and, asc, eq, gt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { describeError, defineJob } from '~/modules/jobs/jobs';
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

/** How often an idle stream looks for new entries. */
const IDLE_SECONDS = 10;

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

/** The stream's next batch after its cursor, in chain order, or null when there is nothing to do. */
const nextBatch = (orgId: string, streamId: string, chainId: string) =>
  withOrg(orgId, async (tx) => {
    const [row] = await tx
      .select()
      .from(auditStreams)
      .where(eq(auditStreams.id, streamId))
      .limit(1);

    // Removed, paused, or another loop owns it now: this loop ends.
    if (!row || row.status !== 'active' || row.chainId !== chainId) return null;

    const entries = await tx
      .select()
      .from(auditLogs)
      .where(gt(auditLogs.chainSeq, row.cursorSeq))
      .orderBy(asc(auditLogs.chainSeq))
      .limit(BATCH);

    return { row, entries, organization: await organizationOf(tx, orgId) };
  });

const StreamPayload = z.object({ streamId: z.string(), chainId: z.string() });

/**
 * One round of a stream: the next entries after its cursor, read in one short
 * transaction and sent after it. The cursor moves only when the endpoint
 * answers 2xx and the stream is still where this round read it. Then the
 * loop goes on: at once after a full batch, after a pause when idle, with
 * growing waits on failure.
 */
export const auditStreamJob = defineJob({
  queue: 'audit.stream',
  leaseSeconds: 60,
  payload: StreamPayload,
  async handle(job) {
    const { streamId, chainId } = job.payload;
    const batch = await nextBatch(job.orgId, streamId, chainId);

    if (!batch) return;

    const { row, entries } = batch;

    const next = (tx: Db, seconds: number) =>
      auditStreamJob.enqueue(tx, {
        orgId: job.orgId,
        payload: { streamId, chainId },
        runAt: new Date(Date.now() + seconds * 1000),
        dedupeKey: `${streamId}:${chainId}:${job.id}`,
        maxAttempts: 3,
      });

    const first = entries.at(0);
    const last = entries.at(-1);

    if (!first || !last) {
      await withOrg(job.orgId, (tx) => next(tx, IDLE_SECONDS));

      return;
    }

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

    await withOrg(job.orgId, async (tx) => {
      // Only from where this round read: a stream paused, moved or re-pointed meanwhile is left alone.
      const unchanged = and(
        eq(auditStreams.id, streamId),
        eq(auditStreams.chainId, chainId),
        eq(auditStreams.status, 'active'),
        eq(auditStreams.cursorSeq, row.cursorSeq),
      );

      if (result.ok) {
        const [moved] = await tx
          .update(auditStreams)
          .set({
            cursorSeq: last.chainSeq ?? row.cursorSeq,
            lastDeliveredAt: sql`now()`,
            lastError: null,
            consecutiveFailures: 0,
          })
          .where(unchanged)
          .returning({ id: auditStreams.id });

        if (moved) await next(tx, entries.length === BATCH ? 0 : IDLE_SECONDS);

        return;
      }

      const [failed] = await tx
        .update(auditStreams)
        .set({
          lastError: result.error,
          consecutiveFailures: sql`${auditStreams.consecutiveFailures} + 1`,
        })
        .where(unchanged)
        .returning({ failures: auditStreams.consecutiveFailures });

      if (!failed) return;

      if (failed.failures === ALERT_AFTER_FAILURES) {
        await securityAlert(tx, job.orgId, {
          key: `audit-stream-failing:${streamId}`,
          title: `The audit log can't reach ${row.name}`,
          body: `${failed.failures} tries in a row failed (${result.error}). Entries wait and are sent once it answers again.`,
          link: '/settings/audit-log',
          email: true,
        }).catch((error: unknown) =>
          log.warn({ err: error, streamId }, 'could not tell owners about a failing audit stream'),
        );
      }

      // 20 s, 40 s, 80 s … at most 15 minutes between tries; nothing is skipped.
      await next(tx, Math.min(10 * 2 ** Math.min(failed.failures, 10), 900));
    });
  },
});

/** Starts (or restarts) the stream's delivery loop; an older loop sees another chain id and stops. */
export const startStreamLoop = async (client: Db, row: StreamRow) => {
  const chainId = newId();

  await client.update(auditStreams).set({ chainId }).where(eq(auditStreams.id, row.id));
  await auditStreamJob.enqueue(client, {
    orgId: row.orgId,
    payload: { streamId: row.id, chainId },
    dedupeKey: `${row.id}:${chainId}:0`,
    maxAttempts: 3,
  });
};
