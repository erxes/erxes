import { AUTH_TOKEN_PURPOSES } from '../enums';
import { check, foreignKey, index, text, timestamp } from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * Single-use links sent by email (invitations, password resets). The link
 * carries `<id>.<secret>`; only the secret's SHA-256 is stored, so a database
 * dump can't be used to take over accounts.
 */
export const authTokens = pgTable(
  'auth_tokens',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    userId: text().notNull(),
    purpose: text({ enum: AUTH_TOKEN_PURPOSES }).notNull(),
    secretHash: text().notNull(),
    expiresAt: timestamptz().notNull(),
    usedAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_auth_tokens_user_idx').on(table.orgId, table.userId, table.purpose),
    check('core_auth_tokens_purpose_check', inList(table.purpose, AUTH_TOKEN_PURPOSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_auth_tokens_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
