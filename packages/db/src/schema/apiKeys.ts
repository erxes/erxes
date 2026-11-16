import { foreignKey, index, text, timestamp } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * A member's API keys, for scripts and other systems. A key acts as its member,
 * with their role as it is at each request, so disabling the member or changing
 * their role applies at once. The key reads `erxes_<id>.<secret>`; only the
 * secret's SHA-256 is stored.
 */
export const apiKeys = pgTable(
  'api_keys',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    userId: text().notNull(),
    name: text().notNull(),
    secretHash: text().notNull(),
    /** Null: it works until it is revoked. */
    expiresAt: timestamptz(),
    /** Updated at most once a minute. */
    lastUsedAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_api_keys_org_user_idx').on(table.orgId, table.userId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_api_keys_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'core_api_keys_user_id_fkey',
    }).onDelete('cascade'),
  ],
);
