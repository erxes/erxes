import { foreignKey, index, text, timestamp } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { organizations } from './organizations';
import { users } from './users';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * An erxes.io admin's visit to the organisation as erxes support (SaaS only). erxes.io vouches
 * for who they are and why; they enter as their own support member (`users.isSupport`), with
 * owner rights, until `endsAt`, or until an owner ends the visit or turns support access off.
 */
export const supportVisits = pgTable(
  'support_visits',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    /** The erxes.io admin's id: one support member per admin. */
    staffId: text().notNull(),
    staffName: text().notNull(),
    staffEmail: text().notNull(),
    /** The support member the visit signs in as. */
    userId: text().notNull(),
    reason: text().notNull(),
    startedAt: timestamptz().defaultNow().notNull(),
    endsAt: timestamptz().notNull(),
    /** Ended early: by an owner, by support access turned off, or by the admin's next visit. */
    endedAt: timestamptz(),
    /** The owner who ended it; null when it ended on its own. */
    endedBy: text(),
  },
  (table) => [
    index('core_support_visits_org_started_idx').on(
      table.orgId,
      table.startedAt.desc(),
      table.id.desc(),
    ),
    index('core_support_visits_org_user_idx').on(table.orgId, table.userId),
    index('core_support_visits_org_staff_idx').on(table.orgId, table.staffId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_support_visits_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'core_support_visits_user_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.endedBy],
      foreignColumns: [users.id],
      name: 'core_support_visits_ended_by_fkey',
    }).onDelete('set null'),
  ],
);
