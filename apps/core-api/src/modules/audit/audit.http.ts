import { auditLogs, db } from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { actorOf, requireManager, userCaller } from '~/http/auth';
import { auditFilters, recordAudit } from './audit.service';

const MAX_ROWS = 100_000;
const BATCH = 1_000;

const ExportQuery = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  action: z.string().trim().max(100).optional(),
  actorId: z.string().trim().max(64).optional(),
  targetType: z.string().trim().max(64).optional(),
  targetId: z.string().trim().max(64).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
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

/** One CSV cell: quoted when needed; a leading =, +, - or @ is defused (spreadsheet formulas). */
const cell = (value: unknown) => {
  let text =
    typeof value === 'string'
      ? value
      : value === null || value === undefined
        ? ''
        : JSON.stringify(value);

  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * `GET /core/v1/audit/export?format=csv|json&…filters`: the audit log as a
 * file, newest first, up to 100,000 entries, streamed in batches. Owners and
 * admins only; the export itself is audited.
 */
export const auditExportRouter = Router();

auditExportRouter.get('/audit/export', (req: Request, res: Response, next) => {
  const actor = actorOf(req);

  requireManager(actor, 'Only owners and admins can export the audit log');

  const parsed = ExportQuery.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      defined: false,
      code: 'INVALID_INPUT',
      status: 400,
      message: 'The request is not valid',
      data: { issues: parsed.error.issues },
    });

    return;
  }

  const { format, ...filters } = parsed.data;
  const scope = and(eq(auditLogs.orgId, actor.orgId), auditFilters(filters));
  const stamp = new Date().toISOString().slice(0, 10);

  res.setHeader(
    'Content-Type',
    format === 'csv' ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8',
  );
  res.setHeader('Content-Disposition', `attachment; filename="audit-log-${stamp}.${format}"`);
  res.setHeader('Cache-Control', 'no-store');

  const run = async () => {
    let after: { createdAt: Date; id: string } | null = null;
    let written = 0;

    res.write(format === 'csv' ? `${COLUMNS.join(',')}\n` : '[');

    while (written < MAX_ROWS) {
      const rows: (typeof auditLogs.$inferSelect)[] = await db()
        .select()
        .from(auditLogs)
        .where(
          and(
            scope,
            after
              ? sql`(${auditLogs.createdAt}, ${auditLogs.id}) < (${after.createdAt}, ${after.id})`
              : undefined,
          ),
        )
        .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
        .limit(Math.min(BATCH, MAX_ROWS - written));

      if (!rows.length) break;

      for (const row of rows) {
        const record = { ...row, createdAt: row.createdAt.toISOString() };

        if (format === 'csv') {
          res.write(`${COLUMNS.map((column) => cell(record[column])).join(',')}\n`);
        } else {
          const { orgId: _org, prevHash: _prev, ...visible } = record;

          res.write(`${written ? ',' : ''}\n${JSON.stringify(visible)}`);
        }

        written += 1;
      }

      const last = rows[rows.length - 1]!;

      after = { createdAt: last.createdAt, id: last.id };
    }

    if (format === 'json') res.write('\n]\n');

    await recordAudit(db(), userCaller(actor), {
      action: 'audit.exported',
      targetType: 'organization',
      targetId: actor.orgId,
      metadata: { format, rows: written, filters },
    });
    res.end();
  };

  run().catch((error: unknown) => {
    if (!res.headersSent) next(error);
    else res.destroy(error instanceof Error ? error : undefined);
  });
});
