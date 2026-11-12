import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const JOB_STATUSES = ['queued', 'running', 'dead'] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

/**
 * Background work (webhook deliveries, automation steps, delayed actions),
 * always for one organisation. Enqueued in the same transaction as the change
 * that asks for it (rolled back = never runs). A worker claims a job for a
 * while (`lockedUntil`); a job whose worker died is claimed again once that
 * passes. Failures retry with backoff, then stay `dead` until retried by hand.
 * Done jobs are deleted.
 */
export const jobs = pgTable(
  'jobs',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    /** What to do: `webhook.deliver`, `automation.step`, … */
    queue: text().notNull(),
    payload: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    status: text({ enum: JOB_STATUSES }).default('queued').notNull(),
    runAt: timestamptz().defaultNow().notNull(),
    attempts: integer().default(0).notNull(),
    maxAttempts: integer().default(8).notNull(),
    lockedUntil: timestamptz(),
    lastError: text(),
    /** One queued job per key (per organisation and queue). */
    dedupeKey: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_jobs_due_idx')
      .on(table.runAt)
      .where(sql`${table.status} = 'queued'`),
    index('core_jobs_stuck_idx')
      .on(table.lockedUntil)
      .where(sql`${table.status} = 'running'`),
    index('core_jobs_org_idx').on(table.orgId, table.queue, table.status),
    uniqueIndex('core_jobs_dedupe_key')
      .on(table.orgId, table.queue, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
    check('core_jobs_status_check', sql`${table.status} IN ('queued', 'running', 'dead')`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_jobs_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
