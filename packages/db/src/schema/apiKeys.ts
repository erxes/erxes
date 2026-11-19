import { API_KEY_KINDS, type API_KEY_ACCESS, type API_KEY_AREAS } from '../enums';
import { sql } from 'drizzle-orm';
import { boolean, check, foreignKey, index, jsonb, text, timestamp } from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt } from './common';
import { organizations } from './organizations';
import { users } from './users';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export type ApiKeyArea = (typeof API_KEY_AREAS)[number];

export type ApiKeyAccess = (typeof API_KEY_ACCESS)[number];

/** What a key may do in each area it names; an area it leaves out is closed. */
export type ApiKeyAreas = Partial<Record<ApiKeyArea, ApiKeyAccess>>;

/** What a regular key may do in each installed plugin's API, by plugin name. */
export type ApiKeyPlugins = Record<string, ApiKeyAccess>;

/** Areas and plugins where a key uses only these of their actions; those it leaves out use all. */
export type ApiKeyActions = Record<string, string[]>;

/**
 * The organisation's API keys, for scripts and other systems. `userId` is the member
 * who made it. A `member` key acts as that member with their role now. A `regular` or
 * `management` key works by its rules: the areas it opens, the contacts it sees (the
 * maker's own, those in `unitIds` or a unit under them, those with one of `tagIds`), the addresses
 * it may call from, and never more than `permissions`, the maker's when it was made, and
 * what the maker's role allows now, even after the maker stops signing in. The key reads `erxes_<id>.<secret>`; only the secret's
 * SHA-256 is stored.
 */
export const apiKeys = pgTable(
  'api_keys',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    userId: text().notNull(),
    name: text().notNull(),
    secretHash: text().notNull(),
    kind: text({ enum: API_KEY_KINDS }).default('member').notNull(),
    areas: jsonb().$type<ApiKeyAreas>().default({}).notNull(),
    /** Regular keys: the plugins whose APIs it may call, read only or read and write. */
    pluginAccess: jsonb().$type<ApiKeyPlugins>().default({}).notNull(),
    /** Where the key uses only some actions, by area or plugin name. */
    actions: jsonb().$type<ApiKeyActions>().default({}).notNull(),
    /** Only contacts the maker owns. */
    ownRecords: boolean().default(false).notNull(),
    /** Only contacts in these units, or units under them. */
    unitIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** Only contacts with one of these tags. */
    tagIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** IPv4 or IPv6 addresses and ranges (CIDR) it may call from; empty for any. */
    allowedIps: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** The maker's permissions when it was made. */
    permissions: text().array(),
    /** Null: it works until it is revoked. */
    expiresAt: timestamptz(),
    /** Updated at most once a minute. */
    lastUsedAt: timestamptz(),
    createdAt: createdAt(),
    updatedAt: timestamptz(),
  },
  (table) => [
    index('core_api_keys_org_user_idx').on(table.orgId, table.userId),
    check('core_api_keys_kind_check', inList(table.kind, API_KEY_KINDS)),
    check(
      'core_api_keys_rules_check',
      sql`${table.kind} = 'member' OR ${table.permissions} IS NOT NULL`,
    ),
    check(
      'core_api_keys_management_expires_check',
      sql`${table.kind} <> 'management' OR ${table.expiresAt} IS NOT NULL`,
    ),
    check(
      'core_api_keys_plugin_access_check',
      sql`${table.kind} = 'regular' OR ${table.pluginAccess} = '{}'::jsonb`,
    ),
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
