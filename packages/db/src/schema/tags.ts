import { CONTENT_TYPES } from '../enums';
import { sql } from 'drizzle-orm';
import { check, foreignKey, index, primaryKey, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { companies } from './companies';
import { customers } from './customers';
import { organizations } from './organizations';

/** Labels for customers and companies (plugins keep their own tags). */
export const tags = pgTable(
  'tags',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    type: text({ enum: CONTENT_TYPES }).notNull(),
    name: text().notNull(),
    colorCode: text(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_tags_org_type_name_key').on(
      table.orgId,
      table.type,
      sql`lower(${table.name})`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_tags_org_id_fkey',
    }).onDelete('cascade'),
    check('core_tags_type_check', sql`${table.type} IN ('customer', 'company')`),
  ],
);

/**
 * Which tags a record has. One table per record type so both sides have real
 * foreign keys: deleting a tag or a record removes its links.
 * `recordId` is the customer / company id.
 */
const tagLinks = (
  name: 'customer_tags' | 'company_tags',
  recordColumn: 'customer_id' | 'company_id',
) => {
  const records = recordColumn === 'customer_id' ? customers : companies;

  return pgTable(
    name,
    {
      orgId: text().notNull(),
      recordId: text(recordColumn).notNull(),
      tagId: text().notNull(),
      createdAt: createdAt(),
    },
    (table) => [
      primaryKey({ columns: [table.recordId, table.tagId], name: `core_${name}_pkey` }),
      index(`core_${name}_tag_idx`).on(table.tagId, table.recordId),
      foreignKey({
        columns: [table.recordId],
        foreignColumns: [records.id],
        name: `core_${name}_${recordColumn}_fkey`,
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.tagId],
        foreignColumns: [tags.id],
        name: `core_${name}_tag_id_fkey`,
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.orgId],
        foreignColumns: [organizations.id],
        name: `core_${name}_org_id_fkey`,
      }).onDelete('cascade'),
    ],
  );
};

export const customerTags = tagLinks('customer_tags', 'customer_id');
export const companyTags = tagLinks('company_tags', 'company_id');
