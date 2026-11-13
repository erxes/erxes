import type { ENTITLEMENT_STATUSES, PLUGIN_TIERS } from '../enums';
import { ORGANIZATION_STATUSES } from '../enums';
import { check, foreignKey, jsonb, text, timestamp } from 'drizzle-orm/pg-core';
import { inList, pgTable } from '../table';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

/** One plugin the organisation has on erxes.io: its tier and billing status (`canceling` ends at `endsAt`). */
export interface EntitledPlugin {
  code: string;
  tier: (typeof PLUGIN_TIERS)[number];
  status: (typeof ENTITLEMENT_STATUSES)[number];
  endsAt?: string | null;
}

/**
 * What erxes.io (the SaaS profile: organisations, marketplace, Stripe)
 * last said an organisation has — read from its entitlement API
 * (`GET /api/platform/organizations/plugins?subdomain=`) and kept here, so
 * an erxes.io outage never locks anyone out. One subscription per
 * organisation on erxes.io; here, each plugin's tier and status.
 * Only on SaaS deployments (`SAAS=true`).
 */
export const entitlements = pgTable(
  'entitlements',
  {
    orgId: text().primaryKey(),
    /** erxes.io's organisation status: `inactive` / `suspended` keep everyone out. */
    orgStatus: text({ enum: ORGANIZATION_STATUSES }).default('active').notNull(),
    plugins: jsonb().$type<EntitledPlugin[]>().default([]).notNull(),
    /** Plugins that left the plan, and when: read-only for the grace period, then turned off. */
    lapsed: jsonb().$type<Record<string, string>>().default({}).notNull(),
    fetchedAt: timestamptz().notNull(),
    /** The last fetch that failed (the stored answer stays in force). */
    lastError: text(),
  },
  (table) => [
    check('core_entitlements_org_status_check', inList(table.orgStatus, ORGANIZATION_STATUSES)),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_entitlements_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * Ids of single-use signed links already used (the dashboard's sign-in
 * hand-off): a second use is refused. Rows go once the link would have
 * expired anyway. Deployment-wide (no organisation): no row level security.
 */
export const usedTokens = pgTable('used_tokens', {
  jti: text().primaryKey(),
  usedAt: timestamptz().defaultNow().notNull(),
  expiresAt: timestamptz().notNull(),
});
