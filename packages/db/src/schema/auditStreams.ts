import { AUDIT_STREAM_FORMATS, AUDIT_STREAM_STATUSES } from '../enums';
import { bigint, check, foreignKey, index, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { inList, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * Sends an organisation's audit log, in chain order, to a log service as it
 * is written (SIEM, Datadog, Splunk, any HTTPS endpoint). `cursor_seq` is
 * the last chain position the endpoint accepted: delivery resumes there
 * after an outage, so nothing is lost or reordered.
 */
export const auditStreams = pgTable(
  'audit_streams',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    name: text().notNull(),
    url: text().notNull(),
    format: text({ enum: AUDIT_STREAM_FORMATS }).default('erxes').notNull(),
    /** Sealed: the HMAC signing secret, and an optional auth header (`DD-API-KEY`, `Authorization`). */
    secretSealed: text().notNull(),
    authHeaderName: text(),
    authHeaderValueSealed: text(),
    status: text({ enum: AUDIT_STREAM_STATUSES }).default('active').notNull(),
    cursorSeq: bigint({ mode: 'number' }).default(0).notNull(),
    /** The delivery loop that owns the stream: resuming starts a new one and the old one stops. */
    chainId: text(),
    lastDeliveredAt: timestamptz(),
    lastError: text(),
    consecutiveFailures: integer().default(0).notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_audit_streams_org_idx').on(table.orgId),
    check('core_audit_streams_format_check', inList(table.format, AUDIT_STREAM_FORMATS)),
    check('core_audit_streams_status_check', inList(table.status, AUDIT_STREAM_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_audit_streams_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
