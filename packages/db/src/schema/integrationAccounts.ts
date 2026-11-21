import { INTEGRATION_ACCOUNT_STATUSES } from '../integrationEnums';
import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

export type IntegrationSecret = Record<string, unknown>;

export interface IntegrationCandidate {
  kind: string;
  externalId: string;
  name: string;
  detail: string | null;
  config: Record<string, unknown>;
  secret: IntegrationSecret;
}

export const integrationAccounts = pgTable(
  'integration_accounts',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    integration: text().notNull(),
    kind: text().notNull(),
    externalId: text().notNull(),
    name: text().notNull(),
    detail: text(),
    config: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    secretSealed: text().notNull(),
    sealedNames: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    status: text({ enum: INTEGRATION_ACCOUNT_STATUSES }).default('healthy').notNull(),
    error: text(),
    checkedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_integration_accounts_org_integration_kind_external_key').on(
      table.orgId,
      table.integration,
      table.kind,
      table.externalId,
    ),
    check(
      'core_integration_accounts_status_check',
      inList(table.status, INTEGRATION_ACCOUNT_STATUSES),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_accounts_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const integrationPicks = pgTable(
  'integration_picks',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    integration: text().notNull(),
    userId: text().notNull(),
    candidatesSealed: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: 'date' }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_picks_org_id_fkey',
    }).onDelete('cascade'),
  ],
);

export const integrationSetups = pgTable(
  'integration_setups',
  {
    orgId: orgIdColumn(),
    integration: text().notNull(),
    values: jsonb().$type<Record<string, unknown>>().default({}).notNull(),
    secretSealed: text(),
    sealedNames: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    updatedBy: text(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.orgId, table.integration],
      name: 'core_integration_setups_pkey',
    }),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_integration_setups_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
