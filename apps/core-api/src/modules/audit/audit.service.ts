import type { AuditEntry, CursorQuery } from '@erxes/core-contract';
import { auditLogs, type Db, newId } from '@erxes/core-db';
import { and, eq, gte, like, lt, lte, sql } from 'drizzle-orm';
import { type Actor, type Caller, requireManager } from '~/http/auth';
import { requestInfo } from '~/http/requestContext';
import type { Changes } from '~/lib/changes';
import { keysetPage } from '~/lib/keyset';

type AuditRow = typeof auditLogs.$inferSelect;

/** Who an entry is recorded for: a member, a plugin, or core itself. */
export type AuditActor = Caller | { orgId: string; actorType: 'system'; actorId?: null };

export interface AuditInput {
  action: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string | null;
  changes?: Changes | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Records one audit entry. Call it inside the same transaction as the change,
 * so a rolled-back change leaves no entry and a committed one always has one.
 * IP and user agent come from the current request.
 */
export const recordAudit = async (client: Db, actor: AuditActor, input: AuditInput | AuditInput[]) => {
  const entries = Array.isArray(input) ? input : [input];

  if (!entries.length) {
    return;
  }

  const { ip, userAgent } = requestInfo();

  await client.insert(auditLogs).values(
    entries.map((entry) => ({
      id: newId(),
      orgId: actor.orgId,
      actorType: actor.actorType,
      actorId: actor.actorId ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      targetLabel: entry.targetLabel ?? null,
      changes: entry.changes ?? null,
      metadata: entry.metadata ?? null,
      ip,
      userAgent,
    })),
  );
};

export const toAuditDto = (row: AuditRow): AuditEntry => ({
  id: row.id,
  actor: { type: row.actorType, id: row.actorId },
  action: row.action,
  targetType: row.targetType,
  targetId: row.targetId,
  targetLabel: row.targetLabel,
  changes: row.changes,
  metadata: row.metadata,
  ip: row.ip,
  userAgent: row.userAgent,
  createdAt: row.createdAt.toISOString(),
});

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const listAudit = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    action?: string;
    actorId?: string;
    targetType?: string;
    targetId?: string;
    from?: string;
    to?: string;
  },
) => {
  requireManager(actor, 'Only owners and admins can see the audit log');

  const filters = and(
    query.action
      ? /[.*]$/.test(query.action)
        ? like(auditLogs.action, `${escapeLike(query.action.replace(/\*$/, ''))}%`)
        : eq(auditLogs.action, query.action)
      : undefined,
    query.actorId ? eq(auditLogs.actorId, query.actorId) : undefined,
    query.targetType ? eq(auditLogs.targetType, query.targetType) : undefined,
    query.targetId ? eq(auditLogs.targetId, query.targetId) : undefined,
    query.from ? gte(auditLogs.createdAt, new Date(query.from)) : undefined,
    query.to ? lte(auditLogs.createdAt, new Date(query.to)) : undefined,
  );

  const page = await keysetPage(
    client,
    { table: auditLogs, id: auditLogs.id, createdAt: auditLogs.createdAt, scope: eq(auditLogs.orgId, actor.orgId) },
    filters,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toAuditDto) };
};

/** Deletes entries past the retention period (all organisations). */
export const pruneAudit = async (client: Db, days: number) => {
  const result = await client.delete(auditLogs).where(lt(auditLogs.createdAt, sql`now() - make_interval(days => ${days})`));

  return result.rowCount ?? 0;
};
