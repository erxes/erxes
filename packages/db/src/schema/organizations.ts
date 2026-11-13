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
    settings: jsonb().$type<OrganizationSettings>().default({}).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('core_organizations_subdomain_key').on(sql`lower(${table.subdomain})`)],
);
