import type { AuditStream } from '@erxes/core-contract';
import { auditLogs, auditStreams, type Db, newId, withOrg } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { newSigningSecret } from '~/lib/crypto';
import { assertOutboundUrl, OutboundError } from '~/lib/outbound';
import { oneRow } from '~/lib/rows';
import { seal } from '~/lib/secrets';
import { recordAudit } from './audit.service';
import { organizationOf, sendBatch, startStreamLoop } from './streamDelivery';
import { formatBatch, type StreamEntry } from './streamFormat';

type StreamRow = typeof auditStreams.$inferSelect;

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
    .select({ seq: sql`coalesce(max(${auditLogs.chainSeq}), 0)`.mapWith(Number) })
    .from(auditLogs)
    .where(eq(auditLogs.orgId, orgId));

  return row?.seq ?? 0;
};

const checkUrl = (url: string) => {
  try {
    assertOutboundUrl(url);
  } catch (error) {
    if (error instanceof OutboundError || error instanceof TypeError) {
      throw new HttpError(400, 'INVALID_URL', error.message);
    }

    throw error;
  }
};

export const listStreams = async (client: Db, actor: Actor) => {
  const rows = await client
    .select()
    .from(auditStreams)
    .where(eq(auditStreams.orgId, actor.orgId))
    .orderBy(auditStreams.createdAt);

  const latest = await latestSeq(client, actor.orgId);

  return { data: rows.map((row) => toDto(row, latest)) };
};

export const createStream = async (
  client: Db,
  actor: Actor,
  input: {
    name: string;
    url: string;
    format: StreamRow['format'];
    authHeader?: { name: string; value: string };
    from: 'now' | 'beginning';
  },
) => {
  checkUrl(input.url);

  const secret = newSigningSecret();
  const latest = await latestSeq(client, actor.orgId);

  const row = oneRow(
    await client
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
      .returning(),
  );

  await startStreamLoop(client, row);
  await recordAudit(client, userCaller(actor), {
    action: 'audit.stream_created',
    targetType: 'audit_stream',
    targetId: row.id,
    targetLabel: input.name,
    metadata: { url: input.url, format: input.format, from: input.from },
  });

  return { stream: toDto(row, latest), secret };
};

const streamOrThrow = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(auditStreams)
    .where(and(eq(auditStreams.orgId, orgId), eq(auditStreams.id, id)))
    .limit(1);

  if (!row) throw notFound('Stream');

  return row;
};

export const updateStream = async (
  client: Db,
  actor: Actor,
  id: string,
  input: {
    name?: string;
    url?: string;
    format?: StreamRow['format'];
    authHeader?: { name: string; value: string } | null;
    status?: 'active' | 'paused';
  },
) => {
  const before = await streamOrThrow(client, actor.orgId, id);

  if (input.url) checkUrl(input.url);

  const row = oneRow(
    await client
      .update(auditStreams)
      .set({
        ...(input.name ? { name: input.name } : {}),
        ...(input.url ? { url: input.url } : {}),
        ...(input.format ? { format: input.format } : {}),
        ...(input.authHeader !== undefined
          ? {
              authHeaderName: input.authHeader?.name ?? null,
              authHeaderValueSealed: input.authHeader ? seal(input.authHeader.value) : null,
            }
          : {}),
        ...(input.status ? { status: input.status } : {}),
        // A new address or a resume starts over the failure count.
        ...(input.url || input.status === 'active'
          ? { consecutiveFailures: 0, lastError: null }
          : {}),
        updatedAt: sql`now()`,
      })
      .where(eq(auditStreams.id, id))
      .returning(),
  );

  if (row.status === 'active' && (before.status !== 'active' || input.url))
    await startStreamLoop(client, row);

  await recordAudit(client, userCaller(actor), {
    action:
      input.status === 'paused'
        ? 'audit.stream_paused'
        : input.status === 'active' && before.status !== 'active'
          ? 'audit.stream_resumed'
          : 'audit.stream_updated',
    targetType: 'audit_stream',
    targetId: id,
    targetLabel: row.name,
    metadata: {
      ...(input.url ? { url: { before: before.url, after: input.url } } : {}),
      ...(input.format ? { format: input.format } : {}),
      ...(input.authHeader !== undefined ? { authHeaderChanged: true } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
  });

  return toDto(row, await latestSeq(client, actor.orgId));
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

/**
 * Sends one made-up entry now (nothing is advanced), to check the address and
 * credentials. Reads in a short scope and calls out after it.
 */
export const testStream = async (actor: Actor, id: string) => {
  const { row, organization } = await withOrg(actor.orgId, async (tx) => ({
    row: await streamOrThrow(tx, actor.orgId, id),
    organization: await organizationOf(tx, actor.orgId),
  }));

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

  return sendBatch(
    row,
    formatBatch(row.format, { streamId: row.id, organization }, [sample], null),
  );
};
