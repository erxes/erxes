import type { AuditStream } from '@erxes/core-contract';
import { auditLogs, auditStreams, type Db, newId, organizations, type Transaction, withOrg } from '@erxes/core-db';
import { and, asc, eq, gt, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { log } from '~/lib/log';
import { assertOutboundUrl, postOutbound } from '~/lib/outbound';
import { seal, unseal } from '~/lib/secrets';
import { enqueueJob, type JobDefinition } from '~/modules/jobs/jobs';
import { signPayload } from '~/modules/webhooks/webhooks.service';
import { recordAudit } from './audit.service';
import { securityAlert } from './alerts';

type StreamRow = typeof auditStreams.$inferSelect;
type AuditRow = typeof auditLogs.$inferSelect;

/** Entries per request; a full batch is followed by the next at once. */
const BATCH = 200;
/** How often an idle stream looks for new entries. */
const IDLE_SECONDS = 10;
/** Owners hear about a stream failing this many times in a row. */
const ALERT_AFTER_FAILURES = 10;

const toDto = (row: StreamRow, latestSeq: number): AuditStream => ({
  id: row.id,
  name: row.name,
  url: row.url,
  format: row.format,
  status: row.status,
  authHeaderName: row.authHeaderName,
  cursorSeq: row.cursorSeq,
  pending: Math.max(0, latestSeq - row.cursorSeq),
  lastDeliveredAt: row.lastDeliveredAt?.toISOString() ?? null,
  lastError: row.lastError,
  consecutiveFailures: row.consecutiveFailures,
  createdAt: row.createdAt.toISOString(),
});

const latestSeq = async (client: Db, orgId: string) => {
  const [row] = await client
    .select({ seq: sql<number>`coalesce(max(${auditLogs.chainSeq}), 0)::bigint` })
    .from(auditLogs)
    .where(eq(auditLogs.orgId, orgId));

  return Number(row?.seq ?? 0);
};

const checkUrl = (url: string) => {
  try {
    assertOutboundUrl(url);
  } catch (error) {
    throw new HttpError(400, 'INVALID_URL', (error as Error).message);
  }
};

/** One entry as the stream sends it: everything needed to check the hash chain on the other side. */
export const streamEntry = (row: AuditRow) => ({
  id: row.id,
  seq: row.chainSeq,
  prevHash: row.prevHash,
  hash: row.hash,
  createdAt: row.createdAt.toISOString(),
  source: row.source,
  action: row.action,
  actor: { type: row.actorType, id: row.actorId },
  target: row.targetType ? { type: row.targetType, id: row.targetId, label: row.targetLabel } : null,
  changes: row.changes,
  metadata: row.metadata,
  ip: row.ip,
  userAgent: row.userAgent,
});

type StreamEntry = ReturnType<typeof streamEntry>;

/**
 * The request body in the service's own format:
 * - `erxes`: `{ stream, organization, gap, entries }` (signed, chain fields included);
 * - `datadog`: the logs intake's JSON array (`ddsource: erxes`, tags per entry);
 * - `splunk`: HTTP Event Collector events, one JSON object per line.
 * A `gap` (entries pruned by retention before they could be sent) is named
 * in every format, so the receiver knows the chain has a hole and why.
 */
export const formatBatch = (
  format: StreamRow['format'],
  context: { streamId: string; organization: { id: string; subdomain: string } },
  entries: StreamEntry[],
  gap: { fromSeq: number; toSeq: number } | null,
) => {
  if (format === 'erxes') {
    return JSON.stringify({ stream: context.streamId, organization: context.organization, gap, entries });
  }

  const gapEntry: StreamEntry[] = gap
    ? [
        {
          id: `gap-${gap.fromSeq}-${gap.toSeq}`,
          seq: null,
          prevHash: null,
          hash: null,
          createdAt: new Date().toISOString(),
          source: 'core',
          action: 'audit.stream_gap',
          actor: { type: 'system', id: null },
          target: null,
          changes: null,
          metadata: { ...gap, reason: 'pruned by retention before delivery' },
          ip: null,
          userAgent: null,
        },
      ]
    : [];
  const all = [...gapEntry, ...entries];

  if (format === 'datadog') {
    return JSON.stringify(
      all.map((entry) => ({
        ddsource: 'erxes',
        service: 'erxes-audit',
        hostname: context.organization.subdomain,
        ddtags: `org:${context.organization.subdomain},source:${entry.source ?? 'core'},action:${entry.action}`,
        message: [entry.action, entry.target?.label ?? entry.target?.id].filter(Boolean).join(' '),
        timestamp: Date.parse(entry.createdAt),
        erxes: entry,
      })),
    );
  }

  return all
    .map((entry) =>
      JSON.stringify({ time: Date.parse(entry.createdAt) / 1000, host: context.organization.subdomain, source: 'erxes', sourcetype: 'erxes:audit', event: entry }),
    )
    .join('\n');
};

const send = async (row: StreamRow, body: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'erxes-audit-stream/1',
    'Erxes-Stream-Id': row.id,
    'Erxes-Signature': signPayload(unseal(row.secretSealed), body),
  };

  if (row.authHeaderName && row.authHeaderValueSealed) headers[row.authHeaderName] = unseal(row.authHeaderValueSealed);

  try {
    const response = await postOutbound(row.url, body, headers, 10_000);

    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      body: response.body,
      error: response.status >= 200 && response.status < 300 ? null : `HTTP ${response.status}`,
      ms: response.ms,
    };
  } catch (error) {
    return { ok: false, status: null, body: null, error: (error as Error).message.slice(0, 500), ms: null };
  }
};

/** Starts (or restarts) the stream's delivery loop; an older loop sees another chain id and stops. */
const startLoop = async (client: Db, row: StreamRow) => {
  const chainId = newId();

  await client.update(auditStreams).set({ chainId }).where(eq(auditStreams.id, row.id));
  await enqueueJob(client, {
    orgId: row.orgId,
    queue: 'audit.stream',
    payload: { streamId: row.id, chainId },
    dedupeKey: `${row.id}:${chainId}:0`,
    maxAttempts: 3,
  });
};

export const listStreams = async (client: Db, actor: Actor) => {
  const rows = await client.select().from(auditStreams).where(eq(auditStreams.orgId, actor.orgId)).orderBy(auditStreams.createdAt);
  const latest = await latestSeq(client, actor.orgId);

  return { data: rows.map((row) => toDto(row, latest)) };
};

export const createStream = async (
  client: Db,
  actor: Actor,
  input: { name: string; url: string; format: StreamRow['format']; authHeader?: { name: string; value: string }; from: 'now' | 'beginning' },
) => {
  checkUrl(input.url);

  const secret = `whsec_${randomBytes(24).toString('base64url')}`;
  const latest = await latestSeq(client, actor.orgId);
  const [row] = await client
    .insert(auditStreams)
    .values({
      id: newId(),
      orgId: actor.orgId,
      name: input.name,
      url: input.url,
      format: input.format,
      secretSealed: seal(secret),
      authHeaderName: input.authHeader?.name ?? null,
      authHeaderValueSealed: input.authHeader ? seal(input.authHeader.value) : null,
      cursorSeq: input.from === 'now' ? latest : 0,
      createdBy: actor.userId,
    })
    .returning();

  await startLoop(client, row!);
  await recordAudit(client, userCaller(actor), {
    action: 'audit.stream_created',
    targetType: 'audit_stream',
    targetId: row!.id,
    targetLabel: input.name,
    metadata: { url: input.url, format: input.format, from: input.from },
  });

  return { stream: toDto(row!, latest), secret };
};

const streamOrThrow = async (client: Db, orgId: string, id: string) => {
  const [row] = await client.select().from(auditStreams).where(and(eq(auditStreams.orgId, orgId), eq(auditStreams.id, id))).limit(1);

  if (!row) throw notFound('Stream');

  return row;
};

export const updateStream = async (
  client: Db,
  actor: Actor,
  id: string,
  input: { name?: string; url?: string; format?: StreamRow['format']; authHeader?: { name: string; value: string } | null; status?: 'active' | 'paused' },
) => {
  const before = await streamOrThrow(client, actor.orgId, id);

  if (input.url) checkUrl(input.url);

  const [row] = await client
    .update(auditStreams)
    .set({
      ...(input.name ? { name: input.name } : {}),
      ...(input.url ? { url: input.url } : {}),
      ...(input.format ? { format: input.format } : {}),
      ...(input.authHeader !== undefined
        ? { authHeaderName: input.authHeader?.name ?? null, authHeaderValueSealed: input.authHeader ? seal(input.authHeader.value) : null }
        : {}),
      ...(input.status ? { status: input.status } : {}),
      // A new address or a resume starts over the failure count.
      ...(input.url || input.status === 'active' ? { consecutiveFailures: 0, lastError: null } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(auditStreams.id, id))
    .returning();

  if (row!.status === 'active' && (before.status !== 'active' || input.url)) await startLoop(client, row!);

  await recordAudit(client, userCaller(actor), {
    action: input.status === 'paused' ? 'audit.stream_paused' : input.status === 'active' && before.status !== 'active' ? 'audit.stream_resumed' : 'audit.stream_updated',
    targetType: 'audit_stream',
    targetId: id,
    targetLabel: row!.name,
    metadata: {
      ...(input.url ? { url: { before: before.url, after: input.url } } : {}),
      ...(input.format ? { format: input.format } : {}),
      ...(input.authHeader !== undefined ? { authHeaderChanged: true } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
  });

  return toDto(row!, await latestSeq(client, actor.orgId));
};

export const removeStream = async (client: Db, actor: Actor, id: string) => {
  const row = await streamOrThrow(client, actor.orgId, id);

  await client.delete(auditStreams).where(eq(auditStreams.id, id));
  await recordAudit(client, userCaller(actor), {
    action: 'audit.stream_removed',
    targetType: 'audit_stream',
    targetId: id,
    targetLabel: row.name,
    metadata: { url: row.url },
  });

  return { ok: true as const };
};

const organizationOf = async (client: Db, orgId: string) => {
  const [org] = await client.select({ id: organizations.id, subdomain: organizations.subdomain }).from(organizations).where(eq(organizations.id, orgId)).limit(1);

  return org ?? { id: orgId, subdomain: orgId };
};

/** Sends one made-up entry now (nothing is advanced), to check the address and credentials. */
export const testStream = async (client: Db, actor: Actor, id: string) => {
  const row = await streamOrThrow(client, actor.orgId, id);
  const sample: StreamEntry = {
    id: 'test',
    seq: null,
    prevHash: null,
    hash: null,
    createdAt: new Date().toISOString(),
    source: 'core',
    action: 'audit.stream_test',
    actor: { type: 'user', id: actor.userId },
    target: null,
    changes: null,
    metadata: { test: true },
    ip: null,
    userAgent: null,
  };
  const result = await send(row, formatBatch(row.format, { streamId: row.id, organization: await organizationOf(client, actor.orgId) }, [sample], null));

  return { ok: result.ok, status: result.status, body: result.body, error: result.error, ms: result.ms };
};

/**
 * One round of a stream: the next entries after its cursor, in chain order.
 * The stream row is locked, so a round never overlaps another; the cursor
 * moves only when the endpoint answers 2xx. Then the loop goes on: at once
 * after a full batch, after a pause when idle, with growing waits on failure.
 */
export const auditStreamJob: JobDefinition = {
  queue: 'audit.stream',
  leaseSeconds: 60,
  async handle(job) {
    const { streamId, chainId } = job.payload as { streamId: string; chainId: string };

    await withOrg(job.orgId, async (tx: Transaction) => {
      const [row] = await tx
        .select()
        .from(auditStreams)
        .where(and(eq(auditStreams.orgId, job.orgId), eq(auditStreams.id, streamId)))
        // Waits for a round already running (never skips it: a skipped row would look removed and end the loop).
        .for('update')
        .limit(1);

      // Removed, paused, or another loop owns it now: this loop ends.
      if (!row || row.status !== 'active' || row.chainId !== chainId) return;

      const entries = await tx
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.orgId, job.orgId), gt(auditLogs.chainSeq, row.cursorSeq)))
        .orderBy(asc(auditLogs.chainSeq))
        .limit(BATCH);
      const next = (seconds: number) =>
        enqueueJob(tx, {
          orgId: job.orgId,
          queue: 'audit.stream',
          payload: { streamId, chainId },
          runAt: new Date(Date.now() + seconds * 1000),
          dedupeKey: `${streamId}:${chainId}:${job.id}`,
          maxAttempts: 3,
        });

      if (!entries.length) {
        await next(IDLE_SECONDS);
        return;
      }

      const firstSeq = entries[0]!.chainSeq ?? row.cursorSeq + 1;
      const gap = firstSeq > row.cursorSeq + 1 ? { fromSeq: row.cursorSeq + 1, toSeq: firstSeq - 1 } : null;
      const body = formatBatch(row.format, { streamId, organization: await organizationOf(tx, job.orgId) }, entries.map(streamEntry), gap);
      const result = await send(row, body);

      if (result.ok) {
        await tx
          .update(auditStreams)
          .set({ cursorSeq: entries.at(-1)!.chainSeq!, lastDeliveredAt: sql`now()`, lastError: null, consecutiveFailures: 0 })
          .where(eq(auditStreams.id, streamId));
        await next(entries.length === BATCH ? 0 : IDLE_SECONDS);
        return;
      }

      const failures = row.consecutiveFailures + 1;

      await tx.update(auditStreams).set({ lastError: result.error, consecutiveFailures: failures }).where(eq(auditStreams.id, streamId));

      if (failures === ALERT_AFTER_FAILURES) {
        await securityAlert(tx, job.orgId, {
          key: `audit-stream-failing:${streamId}`,
          title: `The audit log can't reach ${row.name}`,
          body: `${failures} tries in a row failed (${result.error}). Entries wait and are sent once it answers again.`,
          link: '/settings/audit-log',
          email: true,
        }).catch((error: unknown) => log.warn('could not tell owners about a failing audit stream', { error }));
      }

      // 20 s, 40 s, 80 s … at most 15 minutes between tries; nothing is skipped.
      await next(Math.min(10 * 2 ** Math.min(failures, 10), 900));
    });
  },
};

