import { sql } from 'drizzle-orm';
import { bigint, boolean, check, foreignKey, jsonb, text, timestamp } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'canceled', 'expired'] as const;

/** A plugin in the organisation's plan: until a date (removed at period end), with its own limits. */
export interface PlanPlugin {
  name: string;
  until?: string | null;
  limits?: Record<string, number | null>;
}

/**
 * What an organisation's SaaS subscription allows, as the control plane
 * (erxes.io billing) last said: plan and status, which plugins, and limits.
 * Pushed with a version; an older version never overwrites a newer one.
 * Only on SaaS deployments (`SAAS=true`); self-hosted has no row and no limits.
 */
export const organizationPlans = pgTable(
  'organization_plans',
  {
    orgId: text().primaryKey(),
    plan: text().notNull(),
    planName: text(),
    status: text({ enum: SUBSCRIPTION_STATUSES }).notNull(),
    currentPeriodEnd: timestamptz(),
    /** After the period ends unpaid, changes keep working until then; read-only after. */
    graceUntil: timestamptz(),
    /** Turned off by erxes (abuse, unpaid for long, owner's request): nobody gets in. */
    suspended: boolean().default(false).notNull(),
    suspendedReason: text(),
    plugins: jsonb().$type<PlanPlugin[]>().default([]).notNull(),
    /** `teamMembers` and others; null or missing: unlimited. */
    limits: jsonb().$type<Record<string, number | null>>().default({}).notNull(),
    /** Where owners manage the subscription (erxes.io). */
    manageUrl: text(),
    version: bigint({ mode: 'number' }).notNull(),
    syncedAt: timestamptz().defaultNow().notNull(),
  },
  (table) => [
    check('core_organization_plans_status_check', sql`${table.status} IN ('trialing', 'active', 'past_due', 'canceled', 'expired')`),
    foreignKey({ columns: [table.orgId], foreignColumns: [organizations.id], name: 'core_organization_plans_org_id_fkey' }).onDelete('cascade'),
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
