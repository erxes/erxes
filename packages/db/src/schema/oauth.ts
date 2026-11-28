import { foreignKey, index, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/**
 * Apps that registered themselves (RFC 7591 dynamic registration), such as an MCP client that
 * doesn't publish a client metadata document. The deployment's, before any organisation; one
 * never used is dropped a day after it registered.
 */
export const oauthClients = pgTable('oauth_clients', {
  id: text().primaryKey(),
  name: text().notNull(),
  redirectUris: text().array().notNull(),
  createdAt: createdAt(),
  usedAt: timestamptz(),
});

/**
 * "Sign in with erxes" (OAuth 2.1 / OpenID Connect) for plugins' own apps, and access for MCP
 * clients. Authorization codes live a minute, are used once and need the PKCE verifier; only
 * hashes are stored.
 */
export const oauthCodes = pgTable(
  'oauth_codes',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    clientId: text().notNull(),
    userId: text().notNull(),
    codeHash: text().notNull(),
    redirectUri: text().notNull(),
    codeChallenge: text().notNull(),
    scope: text().notNull(),
    /** The MCP server's address the tokens are for (RFC 8707); null for a plugin's own app. */
    resource: text(),
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
    orgId: orgIdColumn(),
    clientId: text().notNull(),
    userId: text().notNull(),
    familyId: text().notNull(),
    tokenHash: text().notNull(),
    scope: text().notNull(),
    resource: text(),
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
