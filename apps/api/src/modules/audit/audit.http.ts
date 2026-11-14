import { AUDIT_EXPORT_FORMATS } from '@erxes/core-db/enums';
import { auditLogs, requestOrgId, withOrg } from '@erxes/core-db';
import { stringify } from 'csv-stringify/sync';
import { and, desc, type SQL, sql } from 'drizzle-orm';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { callerCan } from '~/http/access';
import { fail, invalidInput } from '~/http/errors';
import { defuse } from '~/lib/csv';
import { repeatWhile } from '~/lib/sequence';
import { auditFilters, recordAudit } from './audit.service';

const MAX_ROWS = 100_000;
const BATCH = 1_000;

const ExportQuery = z.object({
  format: z.enum(AUDIT_EXPORT_FORMATS).default('csv'),
  action: z.string().trim().max(100).optional(),
  actorId: z.string().trim().max(64).optional(),
  targetType: z.string().trim().max(64).optional(),
  targetId: z.string().trim().max(64).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  source: z.string().trim().max(40).optional(),
  ip: z.string().trim().max(64).optional(),
  q: z.string().trim().max(100).optional(),
});

const COLUMNS = [
  'createdAt',
  'source',
  'actorType',
  'actorId',
  'action',
  'targetType',
  'targetId',
  'targetLabel',
  'changes',
  'metadata',
  'ip',
  'userAgent',
  'chainSeq',
  'hash',
] as const;

type AuditRow = typeof auditLogs.$inferSelect;

/** One CSV cell: objects as JSON; a leading =, +, - or @ is defused (spreadsheet formulas). */
const cell = (value: AuditRow[(typeof COLUMNS)[number]]) =>
  defuse(
    value === null
      ? ''
      : value instanceof Date
        ? value.toISOString()
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value),
  );

const line = (format: (typeof AUDIT_EXPORT_FORMATS)[number], row: AuditRow, first: boolean) => {
  if (format === 'csv') return stringify([COLUMNS.map((column) => cell(row[column]))]);

  const { orgId: _org, prevHash: _prev, ...visible } = row;

  return `${first ? '' : ','}\n${JSON.stringify({ ...visible, createdAt: row.createdAt.toISOString() })}`;
};

/** Writes the matching entries, newest first, in batches; returns how many. */
const writeEntries = async (
  res: Response,
  format: (typeof AUDIT_EXPORT_FORMATS)[number],
  scope: SQL | undefined,
) => {
  let after: Pick<AuditRow, 'createdAt' | 'id'> | undefined;
  let written = 0;

  // A short scoped transaction per batch: the export may stream for a while.
  await repeatWhile(Math.ceil(MAX_ROWS / BATCH), async () => {
    const cursor = after;
    const limit = Math.min(BATCH, MAX_ROWS - written);

    const rows = await withOrg(requestOrgId(), (tx) =>
      tx
        .select()
        .from(auditLogs)
        .where(
          and(
            scope,
            cursor
              ? sql`(${auditLogs.createdAt}, ${auditLogs.id}) < (${cursor.createdAt}, ${cursor.id})`
              : undefined,
          ),
        )
        .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
        .limit(limit),
    );

    for (const row of rows) {
      res.write(line(format, row, written === 0));
      written += 1;
    }

    after = rows.at(-1);

    return rows.length === limit && written < MAX_ROWS;
  });

  return written;
};

/**
 * `GET /core/v1/audit/export?format=csv|json&…filters`: the audit log as a
 * file, newest first, up to 100,000 entries, streamed in batches. Owners and
 * admins only; the export itself is audited.
 */
export const auditExportRouter = Router();

auditExportRouter.get('/audit/export', async (req: Request, res: Response) => {
  if (!callerCan('audit.view')) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: 'audit.view',
    });
  }

  const parsed = ExportQuery.safeParse(req.query);

  if (!parsed.success) throw invalidInput(parsed.error);

  const { format, ...filters } = parsed.data;
  const scope = auditFilters(filters);
  const stamp = new Date().toISOString().slice(0, 10);

  res.setHeader(
    'Content-Type',
    format === 'csv' ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8',
  );
  res.setHeader('Content-Disposition', `attachment; filename="audit-log-${stamp}.${format}"`);
  res.setHeader('Cache-Control', 'no-store');

  try {
    res.write(format === 'csv' ? `${COLUMNS.join(',')}\n` : '[');

    const written = await writeEntries(res, format, scope);

    if (format === 'json') res.write('\n]\n');

    const orgId = requestOrgId();

    await withOrg(orgId, (tx) =>
      recordAudit(tx, {
        action: 'audit.exported',
        targetType: 'organization',
        targetId: orgId,
        metadata: { format, rows: written, filters },
      }),
    );
    res.end();
  } catch (error) {
    // Once the file has started, the client can only see it cut short.
    if (!res.headersSent) throw error;

    req.log.error({ err: error }, 'audit export failed');
    res.destroy();
  }
});
