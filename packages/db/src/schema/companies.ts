import { sql } from 'drizzle-orm';
import { foreignKey, index, integer, jsonb, primaryKey, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, type CustomValue, updatedAt } from './common';
import { customers } from './customers';
import { organizations } from './organizations';
import { users } from './users';

/** Organisations the organisation works with, shared by every plugin. */
export const companies = pgTable(
  'companies',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    primaryName: text().notNull(),
    /** Other names (former names, brands), the primary one first. */
    names: text().array().default(sql`'{}'::text[]`).notNull(),
    avatarUrl: text(),
    primaryEmail: text(),
    emails: text().array().default(sql`'{}'::text[]`).notNull(),
    primaryPhone: text(),
    phones: text().array().default(sql`'{}'::text[]`).notNull(),
    website: text(),
    industry: text(),
    size: integer(),
    businessType: text(),
    code: text(),
    description: text(),
    ownerId: text(),
    customFields: jsonb().$type<Record<string, CustomValue>>().default({}).notNull(),
    /** Companies merged into this one. */
    mergedIds: text().array().default(sql`'{}'::text[]`).notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_companies_org_primary_name_key').on(table.orgId, sql`lower(${table.primaryName})`),
    index('core_companies_org_created_idx').on(table.orgId, table.createdAt.desc(), table.id.desc()),
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

/** Which customers belong to which companies (many to many). */
export const customerCompanies = pgTable(
  'customer_companies',
  {
    orgId: text().notNull(),
    customerId: text().notNull(),
    companyId: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.customerId, table.companyId], name: 'core_customer_companies_pkey' }),
    index('core_customer_companies_company_idx').on(table.companyId),
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
