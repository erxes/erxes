import { sql } from 'drizzle-orm';
import { boolean, check, foreignKey, index, jsonb, text } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { type ConditionGroup, createdAt, updatedAt } from './common';
import { organizations } from './organizations';

export interface ViewSort {
  field: string;
  direction: 'asc' | 'desc';
}

/** Lists views belong to: customers, leads (people), companies, company leads, products. */
export const VIEW_RECORD_TYPES = [
  'customer',
  'lead',
  'company',
  'company_lead',
  'product',
] as const;

/**
 * A saved list: a name, a filter (the same condition language automations
 * use), the search, columns and sort. Private to its creator or shared with
 * the team; always run live, so it never goes stale.
 */
export const views = pgTable(
  'views',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    recordType: text({ enum: VIEW_RECORD_TYPES }).notNull(),
    name: text().notNull(),
    filter: jsonb().$type<ConditionGroup>(),
    search: text(),
    /** Column ids in order; null: the list's default columns. */
    columns: jsonb().$type<string[]>(),
    sort: jsonb().$type<ViewSort>(),
    shared: boolean().default(false).notNull(),
    createdBy: text().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_views_org_type_idx').on(table.orgId, table.recordType),
    check(
      'core_views_record_type_check',
      sql`${table.recordType} IN ('customer', 'lead', 'company', 'company_lead', 'product')`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_views_org_id_fkey',
    }).onDelete('cascade'),
  ],
);
