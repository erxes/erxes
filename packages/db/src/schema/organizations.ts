import { sql } from 'drizzle-orm';
import { jsonb, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';

/** Settings an organisation's owners and admins change (Settings → File upload, …). */
export interface OrganizationSettings {
  files?: {
    /** Largest upload in MB; at most the deployment's FILES_MAX_SIZE_MB. */
    maxSizeMb?: number;
    /** Allowed types: MIME types (`image/png`), wildcards (`image/*`) or extensions (`.pdf`). Empty: any. */
    allowedTypes?: string[];
  };
  audit?: {
    /** How long audit entries are kept; at most the deployment's AUDIT_RETENTION_DAYS. */
    retentionDays?: number;
  };
  /** Whether erxes support may enter (SaaS): on unless an owner turned it off. */
  supportAccess?: {
    enabled: boolean;
  };
}

/**
 * 3.x's "With team member restrictions" (Settings › General): while `enabled`, a member other
 * than an owner sees the records of their own branches and departments and the ones under them,
 * except the members listed for every branch or every department. Plugins apply it to their lists
 * (`units.restrictions`).
 */
export interface MemberRestrictions {
  enabled: boolean;
  /** Members who see every branch. */
  allBranchesUserIds: string[];
  /** Members who see every department. */
  allDepartmentsUserIds: string[];
}

/** A tenant. `id` is permanent; `subdomain` may change (never reused). */
export const organizations = pgTable(
  'organizations',
  {
    id: text().primaryKey(),
    subdomain: text().notNull(),
    name: text().notNull(),
    /** ISO 3166 alpha-2 (`MN`); null until chosen. */
    country: text(),
    /** ISO 4217 (`MNT`): what new products and invoices are in. */
    currency: text().default('USD').notNull(),
    defaultGatewayId: text(),
    /** ISO 4217 codes besides `currency` it trades in (3.x's deal currencies), in its order. */
    currencies: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** IANA (`Asia/Ulaanbaatar`): the wall clock and the day every schedule runs by. */
    timezone: text().default('UTC').notNull(),
    /** How to reach it, as printed on its documents (3.x's structure phone number and email). */
    phone: text(),
    email: text(),
    settings: jsonb().$type<OrganizationSettings>().default({}).notNull(),
    memberRestrictions: jsonb()
      .$type<MemberRestrictions>()
      .default({ enabled: false, allBranchesUserIds: [], allDepartmentsUserIds: [] })
      .notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('core_organizations_subdomain_key').on(sql`lower(${table.subdomain})`)],
);
