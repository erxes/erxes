import type { AuditEntry, CursorQuery } from '@erxes/core-contract';
import { auditLogs, type Db, newId, organizations } from '@erxes/core-db';
import { and, eq, gte, ilike, like, lte, or, sql } from 'drizzle-orm';
import { config } from '~/config';
import { type Actor, type Caller, type PluginCaller, requireManager } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { assertMember, assertPluginNamespace } from '~/lib/guards';
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
  /** Plugins pass the end user's address and browser; otherwise the request's. */
  ip?: string | null;
  userAgent?: string | null;
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
      ip: entry.ip ?? ip,
      userAgent: entry.userAgent ?? userAgent,
      source: 'source' in actor ? actor.source : 'core',
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
  source: row.source,
  createdAt: row.createdAt.toISOString(),
});

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export interface AuditFilters {
  action?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  source?: string;
  ip?: string;
  q?: string;
}

/** The list's filters, shared with the export. */
export const auditFilters = (query: AuditFilters) => {
  return and(
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
    query.source ? eq(auditLogs.source, query.source) : undefined,
    query.ip ? eq(auditLogs.ip, query.ip) : undefined,
    ...(query.q ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        or(
          ilike(auditLogs.action, `%${escapeLike(word)}%`),
          ilike(auditLogs.targetLabel, `%${escapeLike(word)}%`),
          eq(auditLogs.targetId, word),
        ),
      ),
  );
};

export const listAudit = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & AuditFilters,
) => {
  requireManager(actor, 'Only owners and admins can see the audit log');

  const filters = auditFilters(query);

  const page = await keysetPage(
    client,
    {
      table: auditLogs,
      id: auditLogs.id,
      createdAt: auditLogs.createdAt,
      scope: eq(auditLogs.orgId, actor.orgId),
      countCap: 10_000,
    },
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

/**
 * Deletes entries past each organisation's retention (at most the
 * deployment's AUDIT_RETENTION_DAYS). The table is append-only in the
 * database; only a transaction that sets `core.audit_prune` may delete.
 */
export const pruneAudit = (client: Db, maxDays: number) =>
  client.transaction(async (tx) => {
    await tx.execute(sql`set local core.audit_prune = 'on'`);

    const result = await tx.execute(sql`
      delete from ${auditLogs} a using ${organizations} o
      where o.id = a.org_id
        and a.created_at < now() - make_interval(days => least(
          ${maxDays}::int,
          coalesce((o.settings -> 'audit' ->> 'retentionDays')::int, ${maxDays}::int)
        ))
    `);

    return result.rowCount ?? 0;
  });

/** Plugins record their own actions in the organisation's one audit log. */
export const recordPluginAudit = async (
  client: Db,
  caller: PluginCaller,
  entries: (AuditInput & { actorUserId?: string })[],
) => {
  for (const entry of entries) {
    assertPluginNamespace(caller.plugin, entry.action);
    await assertMember(client, caller.orgId, entry.actorUserId);
  }

  // One entry per actor: a member acting through the plugin, or the plugin itself.
  for (const entry of entries) {
    const { actorUserId, ...rest } = entry;

    await recordAudit(
      client,
      {
        orgId: caller.orgId,
        actorType: actorUserId ? 'user' : 'plugin',
        actorId: actorUserId ?? caller.plugin,
        source: caller.plugin,
      },
      rest,
    );
  }

  return { recorded: entries.length };
};

/**
 * Re-computes the organisation's hash chain: every entry's hash must match
 * its contents and the previous entry's hash, positions without gaps. The
 * oldest kept entry is the anchor (older ones may have been pruned).
 */
export const verifyAudit = async (client: Db, actor: Actor) => {
  requireManager(actor, 'Only owners and admins can check the audit log');

  const result = await client.execute<{ checked: number; broken_at: number | null }>(sql`
    with chain as (
      select a.chain_seq,
             a.hash,
             a.prev_hash,
             core_audit_entry_hash(a.prev_hash, a) as expected,
             lag(a.hash) over (order by a.chain_seq) as previous_hash,
             lag(a.chain_seq) over (order by a.chain_seq) as previous_seq
      from core_audit_logs a
      where a.org_id = ${actor.orgId} and a.chain_seq is not null
    )
    select count(*)::int as checked,
           min(chain_seq) filter (
             where hash is distinct from expected
                or (previous_seq is not null and (prev_hash is distinct from previous_hash or chain_seq <> previous_seq + 1))
           )::int as broken_at
    from chain
  `);
  const row = result.rows[0] ?? { checked: 0, broken_at: null };

  return { ok: row.broken_at === null, checked: row.checked, brokenAt: row.broken_at };
};

export const auditSettings = async (client: Db, orgId: string) => {
  const [row] = await client
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  const max = config.retention.auditDays;

  return { retentionDays: Math.min(row?.settings.audit?.retentionDays ?? max, max), maxRetentionDays: max };
};

export const updateAuditSettings = async (client: Db, actor: Actor, input: { retentionDays: number }) => {
  if (actor.role !== 'owner') {
    throw new HttpError(403, 'OWNER_ONLY', 'Only owners can change how long the audit log is kept');
  }

  if (input.retentionDays > config.retention.auditDays) {
    throw new HttpError(400, 'LIMIT_EXCEEDED', `This server keeps audit entries up to ${config.retention.auditDays} days`);
  }

  const before = await auditSettings(client, actor.orgId);

  await client.transaction(async (tx) => {
    await tx
      .update(organizations)
      .set({
        settings: sql`jsonb_set(${organizations.settings}, '{audit}', ${JSON.stringify({ retentionDays: input.retentionDays })}::jsonb)`,
        updatedAt: sql`now()`,
      })
      .where(eq(organizations.id, actor.orgId));
    await recordAudit(tx, { orgId: actor.orgId, actorType: 'user', actorId: actor.userId, source: 'core' }, {
      action: 'settings.audit_retention_changed',
      targetType: 'organization',
      targetId: actor.orgId,
      changes: { retentionDays: [before.retentionDays, input.retentionDays] },
    });
  });

  return auditSettings(client, actor.orgId);
};
