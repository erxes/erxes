import { CUSTOMER_STATES } from '../enums';
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { customers } from './customers';
import { leadStages } from './leadStages';
import { organizations } from './organizations';
import { users } from './users';

/** Organisations the organisation works with, shared by every plugin. */
export const companies = pgTable(
  'companies',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    primaryName: text().notNull(),
    /** `lead`: not a customer yet; companies go through the same lead stages as people. */
    state: text({ enum: CUSTOMER_STATES }).default('customer').notNull(),
    /** Other names (former names, brands), the primary one first. */
    names: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    avatarUrl: text(),
    primaryEmail: text(),
    emails: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    primaryPhone: text(),
    phones: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    website: text(),
    industry: text(),
    size: integer(),
    businessType: text(),
    code: text(),
    description: text(),
    ownerId: text(),
    leadStageId: text(),
    leadStageChangedAt: timestamp({ withTimezone: true, mode: 'date' }),
    disqualifyReason: text(),
    source: text(),
    sourceDetails: jsonb().$type<Record<string, string>>().default({}).notNull(),
    convertedAt: timestamp({ withTimezone: true, mode: 'date' }),
    convertedBy: text(),
    /** When the newest timeline entry was made (creation counts); kept by a trigger on core_activities. */
    lastActivityAt: timestamp({ withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    /** Names, emails, phones and code in lower case: what the search box searches (trigram indexed). */
    searchText: text().generatedAlwaysAs(
      sql`lower(core_join_text(names) || ' ' || primary_name || ' ' || core_join_text(emails) || ' ' || core_join_text(phones) || ' ' || coalesce(code, ''))`,
    ),
    /** Companies merged into this one. */
    mergedIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_companies_org_primary_name_key').on(
      table.orgId,
      sql`lower(${table.primaryName})`,
    ),
    index('core_companies_org_created_idx').on(
      table.orgId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    index('core_companies_org_last_activity_idx').on(table.orgId, table.lastActivityAt),
    index('core_companies_org_state_idx').on(table.orgId, table.state),
    index('core_companies_org_lead_stage_idx').on(
      table.orgId,
      table.leadStageId,
      table.createdAt.desc(),
    ),
    index('core_companies_org_source_idx').on(table.orgId, table.source),
    index('core_companies_org_converted_idx')
      .on(table.orgId, table.convertedAt)
      .where(sql`${table.convertedAt} IS NOT NULL`),
    foreignKey({
      columns: [table.leadStageId],
      foreignColumns: [leadStages.id],
      name: 'core_companies_lead_stage_id_fkey',
    }).onDelete('set null'),
    check('core_companies_state_check', inList(table.state, CUSTOMER_STATES)),
    index('core_companies_org_owner_idx').on(table.orgId, table.ownerId),
    index('core_companies_org_industry_idx').on(table.orgId, sql`lower(${table.industry})`),
    index('core_companies_search_trgm_idx').using('gin', table.searchText.op('gin_trgm_ops')),
    index('core_companies_primary_name_trgm_idx').using(
      'gin',
      table.primaryName.op('gin_trgm_ops'),
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_companies_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
      name: 'core_companies_owner_id_fkey',
    }).onDelete('set null'),
  ],
);

/**
 * People and companies are peers, linked many to many; a link says what the
 * person is there (`role`), whether they are the company's main contact,
 * and since when they are not there any more (the link stays, as history).
 */
export const customerCompanies = pgTable(
  'customer_companies',
  {
    orgId: orgIdColumn(),
    customerId: text().notNull(),
    companyId: text().notNull(),
    /** "CEO", "Buyer", "Accountant" … */
    role: text(),
    /** The company's main contact (at most one per company). */
    isPrimaryContact: boolean().default(false).notNull(),
    /** Left the company: a former link. */
    endedAt: timestamp({ withTimezone: true, mode: 'date' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.customerId, table.companyId],
      name: 'core_customer_companies_pkey',
    }),
    index('core_customer_companies_company_idx').on(table.companyId),
    uniqueIndex('core_customer_companies_primary_contact_key')
      .on(table.companyId)
      .where(sql`${table.isPrimaryContact}`),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: 'core_customer_companies_customer_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.companyId],
      foreignColumns: [companies.id],
      name: 'core_customer_companies_company_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_customer_companies_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
