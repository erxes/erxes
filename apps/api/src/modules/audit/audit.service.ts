import type { CursorQuery } from '@erxes/core-contract';
import {
  actorOf,
  auditLogs,
  caller,
  type Db,
  newId,
  organizations,
  sourceOf,
} from '@erxes/core-db';
import { and, eq, gte, ilike, like, lte, or, sql } from 'drizzle-orm';
import { config } from '~/config';
import { HttpError } from '~/http/errors';
import { assertMembers, assertPluginNamespace } from '~/lib/guards';
import { requestInfo } from '~/http/requestContext';
import type { Changes } from '~/lib/changes';
import { currentRunCause } from '~/lib/causation';
import { keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { deleteInBatches, inOrder } from '~/lib/sequence';
import { findChainBreak, signAuditCheckpoints, verifyCheckpoints } from './checkpoints';
import { raiseAlerts } from './alerts';

/** The actor columns of the entries and where they came from (`core` or the plugin). */
type RecordedBy = ReturnType<typeof actorOf> & { source: string };

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

const writeAudit = async (client: Db, by: RecordedBy, entries: AuditInput[]) => {
  if (!entries.length) {
    return;
  }

  const cause = currentRunCause();
  const { ip, userAgent } = requestInfo();

  await client.insert(auditLogs).values(
    entries.map((entry) => ({
      id: newId(),
      actorType: by.actorType,
      actorId: by.actorId,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      targetLabel: entry.targetLabel ?? null,
      changes: entry.changes ?? null,
      // Done by an automation's action: say which, on every entry.
      metadata: cause
        ? {
            ...entry.metadata,
            automation: { id: cause.automationId, name: cause.automationName, run: cause.runId },
          }
        : (entry.metadata ?? null),
      ip: entry.ip ?? ip,
      userAgent: entry.userAgent ?? userAgent,
      source: by.source,
    })),
  );

  await raiseAlerts(
    client,
    by,
    entries.map((entry) => ({
      ...entry,
      ip: entry.ip ?? ip,
      userAgent: entry.userAgent ?? userAgent,
    })),
  );
};

/**
 * Records audit entries for the caller (`caller()`). Call it inside the same
 * transaction as the change, so a rolled-back change leaves no entry and a
 * committed one always has one. The entries belong to the scope's
 * organisation, so it runs inside `withOrg`. IP and user agent come from the
 * current request.
 */
export const recordAudit = (client: Db, input: AuditInput | AuditInput[]) => {
  const who = caller();

  return writeAudit(
    client,
    { ...actorOf(who), source: sourceOf(who) },
    Array.isArray(input) ? input : [input],
  );
};

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

export const listAudit = async (client: Db, query: CursorQuery & AuditFilters) => {
  const filters = auditFilters(query);

  return keysetPage(
    client,
    {
      table: auditLogs,
      id: auditLogs.id,
      createdAt: auditLogs.createdAt,

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
};

/**
 * Deletes entries past each organisation's retention (at most the
 * deployment's AUDIT_RETENTION_DAYS). The table is append-only in the
 * database; only a transaction that sets `core.audit_prune` may delete.
 */
export const pruneAudit = async (client: Db, maxDays: number) => {
  await client.execute(sql`set local core.audit_prune = 'on'`);

  return deleteInBatches(200, 5000, () =>
    client.execute(sql`
      delete from ${auditLogs} where id in (
        select a.id from ${auditLogs} a join ${organizations} o on o.id = a.org_id
        where a.created_at < now() - make_interval(days => least(
          ${maxDays}::int,
          coalesce((o.settings -> 'audit' ->> 'retentionDays')::int, ${maxDays}::int)
        ))
        limit 5000
      )
    `),
  );
};

/** Plugins record their own actions in the organisation's one audit log. */
export const recordPluginAudit = async (
  client: Db,
  entries: (AuditInput & { actorUserId?: string })[],
) => {
  const { plugin } = caller('plugin');

  for (const entry of entries) assertPluginNamespace(plugin, entry.action);

  await assertMembers(
    client,
    entries.map((entry) => entry.actorUserId),
  );

  // Each entry's actor is a member acting through the plugin, or the plugin itself.
  // Neighbours with the same actor share one insert; the log keeps the order sent.
  const runs: { actorUserId?: string; entries: AuditInput[] }[] = [];

  for (const { actorUserId, ...rest } of entries) {
    const last = runs.at(-1);

    if (last && last.actorUserId === actorUserId) last.entries.push(rest);
    else runs.push({ actorUserId, entries: [rest] });
  }

  await inOrder(runs, (run) =>
    writeAudit(
      client,
      {
        actorType: run.actorUserId ? 'user' : 'plugin',
        actorId: run.actorUserId ?? plugin,
        source: plugin,
      },
      run.entries,
    ),
  );

  return { recorded: entries.length };
};

/**
 * Re-computes the organisation's hash chain: every entry's hash must match
 * its contents and the previous entry's hash, positions without gaps. The
 * oldest kept entry is the anchor (older ones may have been pruned).
 */
export const verifyAudit = async (client: Db) => {
  const chain = await findChainBreak(client);
  const checkpoints = await verifyCheckpoints(client, chain.firstSeq);

  // An intact log gets a fresh checkpoint now, not at the next scheduled one.
  if (chain.brokenAt === null && checkpoints.mismatchAt === null) {
    await signAuditCheckpoints(client);
  }

  return {
    ok: chain.brokenAt === null && checkpoints.mismatchAt === null,
    checked: chain.checked,
    brokenAt: chain.brokenAt,
    checkpoints,
  };
};

export const auditSettings = async (client: Db) => {
  const [row] = await client
    .select({ settings: organizations.settings })
    .from(organizations)
    .limit(1);

  const max = config.retention.auditDays;

  return {
    retentionDays: Math.min(row?.settings.audit?.retentionDays ?? max, max),
    maxRetentionDays: max,
  };
};

export const updateAuditSettings = async (client: Db, input: { retentionDays: number }) => {
  if (input.retentionDays > config.retention.auditDays) {
    throw new HttpError(
      400,
      'LIMIT_EXCEEDED',
      `This server keeps audit entries up to ${config.retention.auditDays} days`,
    );
  }

  const before = await auditSettings(client);

  const organization = oneRow(
    await client
      .update(organizations)
      .set({
        settings: sql`jsonb_set(${organizations.settings}, '{audit}', ${JSON.stringify({ retentionDays: input.retentionDays })}::jsonb)`,
        updatedAt: sql`now()`,
      })
      .returning({ id: organizations.id }),
  );

  await recordAudit(client, {
    action: 'settings.audit_retention_changed',
    targetType: 'organization',
    targetId: organization.id,
    changes: { retentionDays: [before.retentionDays, input.retentionDays] },
  });

  return auditSettings(client);
};
