import { LEAD_STAGE_KINDS } from '../enums';
import { sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/**
 * The stages a lead moves through, the organisation's own (New → Contacted →
 * Qualified …), in order. Every organisation starts with a default set.
 */
export const leadStages = pgTable(
  'lead_stages',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    name: text().notNull(),
    kind: text({ enum: LEAD_STAGE_KINDS }).default('open').notNull(),
    /** `#rrggbb` */
    color: text().default('#64748b').notNull(),
    order: integer().default(0).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_lead_stages_org_name_key').on(table.orgId, sql`lower(${table.name})`),
    index('core_lead_stages_org_order_idx').on(table.orgId, table.order),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_lead_stages_org_id_fkey',
    }).onDelete('cascade'),
    check(
      'core_lead_stages_kind_check',
      sql`${table.kind} IN ('open', 'qualified', 'disqualified')`,
    ),
  ],
);
