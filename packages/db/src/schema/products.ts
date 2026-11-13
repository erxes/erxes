import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  foreignKey,
  index,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

export const PRODUCT_KINDS = ['goods', 'service'] as const;
export const PRODUCT_STATUSES = ['active', 'archived'] as const;

/** Groups of products, nested by `parentId`. */
export const productCategories = pgTable(
  'product_categories',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    name: text().notNull(),
    parentId: text(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex('core_product_categories_org_id_id_key').on(table.orgId, table.id),
    uniqueIndex('core_product_categories_org_parent_name_key').on(
      table.orgId,
      sql`coalesce(${table.parentId}, '')`,
      sql`lower(${table.name})`,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_product_categories_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.parentId],
      foreignColumns: [table.orgId, table.id],
      name: 'core_product_categories_parent_fkey',
    }),
  ],
);

/**
 * The organisation's one catalog of goods and services, shared by every
 * plugin (sales, e-commerce, PMS, TMS …). `plugins` lists the plugins that
 * use a product: each sees its own by default. What only one plugin needs
 * (stock, storefront pages, delivery rules) stays in that plugin's tables,
 * keyed by the product id. Products are archived, never deleted: orders and
 * invoices keep pointing at them. Prices are integers in the currency's
 * smallest unit (cents: $12.50 → 1250), like invoices.
 */
export const products = pgTable(
  'products',
  {
    id: text().primaryKey(),
    orgId: text().notNull(),
    kind: text({ enum: PRODUCT_KINDS }).notNull(),
    status: text({ enum: PRODUCT_STATUSES }).default('active').notNull(),
    name: text().notNull(),
    /** The organisation's own code (SKU), unique when set. */
    code: text(),
    barcode: text(),
    categoryId: text(),
    description: text(),
    /** `pcs`, `kg`, `night`, `km` … */
    unit: text().default('pcs').notNull(),
    price: bigint({ mode: 'number' }).default(0).notNull(),
    /** ISO 4217; the organisation's currency when the product was made. */
    currency: text().notNull(),
    /** Files in core's storage; the first is the main image. */
    imageIds: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    /** For shipping: grams and millimetres. */
    weightGrams: integer(),
    lengthMm: integer(),
    widthMm: integer(),
    heightMm: integer(),
    plugins: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    archivedAt: timestamp({ withTimezone: true, mode: 'date' }),
  },
  (table) => [
    uniqueIndex('core_products_org_id_id_key').on(table.orgId, table.id),
    uniqueIndex('core_products_org_code_key')
      .on(table.orgId, sql`lower(${table.code})`)
      .where(sql`${table.code} IS NOT NULL`),
    uniqueIndex('core_products_org_barcode_key')
      .on(table.orgId, table.barcode)
      .where(sql`${table.barcode} IS NOT NULL`),
    index('core_products_org_created_idx').on(table.orgId, table.createdAt, table.id),
    index('core_products_org_category_idx').on(table.orgId, table.categoryId),
    index('core_products_plugins_idx').using('gin', table.plugins),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_products_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.categoryId],
      foreignColumns: [productCategories.orgId, productCategories.id],
      name: 'core_products_category_fkey',
    }),
    check('core_products_kind_check', sql`${table.kind} IN ('goods', 'service')`),
    check('core_products_status_check', sql`${table.status} IN ('active', 'archived')`),
    check('core_products_price_check', sql`${table.price} >= 0`),
    check(
      'core_products_size_check',
      sql`coalesce(${table.weightGrams}, 0) >= 0 AND coalesce(${table.lengthMm}, 0) >= 0 AND coalesce(${table.widthMm}, 0) >= 0 AND coalesce(${table.heightMm}, 0) >= 0`,
    ),
  ],
);
