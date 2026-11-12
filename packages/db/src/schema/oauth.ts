import { foreignKey, index, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * "Sign in with erxes" (OAuth 2.1 / OpenID Connect) for plugins' own apps.
 * Authorization codes live a minute, are used once and need the PKCE
 * verifier; only hashes are stored.
 */
export const oauthCodes = pgTable(
  'oauth_codes',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    clientId: text().notNull(),
    userId: text().notNull(),
    codeHash: text().notNull(),
    redirectUri: text().notNull(),
    codeChallenge: text().notNull(),
    scope: text().notNull(),
    nonce: text(),
    expiresAt: timestamptz().notNull(),
    usedAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_oauth_codes_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * Refresh tokens, rotated on every use. A token used twice means it leaked:
 * its whole family is revoked. Tied to the member's session version, so
 * "sign out everywhere", a password change or disabling ends them too.
 */
export const oauthRefreshTokens = pgTable(
  'oauth_refresh_tokens',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    clientId: text().notNull(),
    userId: text().notNull(),
    familyId: text().notNull(),
    tokenHash: text().notNull(),
    scope: text().notNull(),
    sessionVersion: integer().notNull(),
    expiresAt: timestamptz().notNull(),
    usedAt: timestamptz(),
    revokedAt: timestamptz(),
    createdAt: createdAt(),
  },
  (table) => [
    index('core_oauth_refresh_tokens_family_idx').on(table.familyId),
    index('core_oauth_refresh_tokens_user_idx').on(table.orgId, table.userId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_oauth_refresh_tokens_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
