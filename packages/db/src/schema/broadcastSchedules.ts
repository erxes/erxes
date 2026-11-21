import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  smallint,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { REPEAT_FREQUENCIES, REPEAT_STATES } from '../emailEnums';
import { inList, orgIdColumn, pgTable } from '../table';
import { broadcasts } from './broadcasts';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type RepeatFrequency = (typeof REPEAT_FREQUENCIES)[number];

export type RepeatState = (typeof REPEAT_STATES)[number];

/**
 * A recurring broadcast's schedule. The broadcast never sends itself: each
 * moment of the schedule copies its content and audience into a new broadcast
 * (`parentId`, `occurrenceAt`) that sends as a scheduled one does. Times are
 * on the organisation's clock (`core_organizations.timezone`).
 */
export const broadcastSchedules = pgTable(
  'broadcast_schedules',
  {
    broadcastId: text().primaryKey(),
    orgId: orgIdColumn(),
    frequency: text({ enum: REPEAT_FREQUENCIES }).notNull(),
    /** Every `interval` days, weeks or months, counted from `startsOn`. */
    interval: smallint().default(1).notNull(),
    /** `week`: 1 = Monday … 7 = Sunday. */
    weekdays: smallint()
      .array()
      .default(sql`'{}'::smallint[]`)
      .notNull(),
    /** `month`: the day; past a month's last day (31 in April) it runs on the last day. */
    dayOfMonth: smallint(),
    /** `HH:MM` on the organisation's clock. */
    at: text().notNull(),
    /** The first day it may run, and where `interval` counts from. */
    startsOn: date({ mode: 'string' }).notNull(),
    /** The last day it may run; null: no end date. */
    endsOn: date({ mode: 'string' }),
    /** It ends after this many runs; null: no limit. */
    maxRuns: integer(),
    state: text({ enum: REPEAT_STATES }).default('draft').notNull(),
    /** The next moment it runs, while active. */
    nextRunAt: timestamptz(),
    /** Runs created so far: the broadcasts with this one as their parent. */
    runs: integer().default(0).notNull(),
    lastRunAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // The tick finds the schedules that are due.
    index('core_broadcast_schedules_due_idx')
      .on(table.nextRunAt)
      .where(sql`${table.state} = 'active'`),
    check('core_broadcast_schedules_frequency_check', inList(table.frequency, REPEAT_FREQUENCIES)),
    check('core_broadcast_schedules_state_check', inList(table.state, REPEAT_STATES)),
    check('core_broadcast_schedules_interval_check', sql`${table.interval} between 1 and 99`),
    check('core_broadcast_schedules_day_of_month_check', sql`${table.dayOfMonth} between 1 and 31`),
    check(
      'core_broadcast_schedules_at_check',
      sql`${table.at} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'`,
    ),
    check('core_broadcast_schedules_max_runs_check', sql`${table.maxRuns} > 0`),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_broadcast_schedules_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.broadcastId],
      foreignColumns: [broadcasts.id],
      name: 'core_broadcast_schedules_broadcast_id_fkey',
    }).onDelete('cascade'),
  ],
);
