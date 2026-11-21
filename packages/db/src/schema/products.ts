import { PRODUCT_KINDS, PRODUCT_STATUSES } from '../enums';
import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  doublePrecision,
  foreignKey,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { inList, orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { organizations } from './organizations';

/** Groups of products, nested by `parentId`. */
export const productCategories = pgTable(
  'product_categories',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
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
 * use a product: each sees its own by default. Its stock by branch and
 * department is `productInventories`. What only one plugin needs (storefront
 * pages, delivery rules) stays in that plugin's tables, keyed by the product id. Products are archived, never deleted: orders and
 * invoices keep pointing at them. Prices are integers in the currency's
 * smallest unit (cents: $12.50 → 1250), like invoices.
 */
export const products = pgTable(
  'products',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
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
    /**
     * A variant points at the item it is a variant of (size M of a T-shirt), one level deep.
     * Each variant is its own product, with its own code, barcode and price.
     */
    parentId: text(),
    /** What sets a variant apart, by option name: `{ Size: 'M', Color: 'Red' }`. */
    variantOptions: jsonb().$type<Record<string, string>>().default({}).notNull(),
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
    // In the list's order (newest first, as keysetPage sorts), so a page reads it instead of sorting.
    index('core_products_org_created_idx').on(table.orgId, table.createdAt.desc(), table.id.desc()),
    // Search: "contains" on the name and the code.
    index('core_products_name_trgm_idx').using('gin', table.name.op('gin_trgm_ops')),
    index('core_products_code_trgm_idx').using('gin', table.code.op('gin_trgm_ops')),
    index('core_products_org_category_idx').on(table.orgId, table.categoryId),
    index('core_products_org_parent_idx')
      .on(table.orgId, table.parentId)
      .where(sql`${table.parentId} IS NOT NULL`),
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
    foreignKey({
      columns: [table.orgId, table.parentId],
      foreignColumns: [table.orgId, table.id],
      name: 'core_products_parent_fkey',
    }),
    check('core_products_parent_check', sql`${table.parentId} <> ${table.id}`),
    check('core_products_kind_check', inList(table.kind, PRODUCT_KINDS)),
    check('core_products_status_check', inList(table.status, PRODUCT_STATUSES)),
    check('core_products_price_check', sql`${table.price} >= 0`),
    check(
      'core_products_size_check',
      sql`coalesce(${table.weightGrams}, 0) >= 0 AND coalesce(${table.lengthMm}, 0) >= 0 AND coalesce(${table.widthMm}, 0) >= 0 AND coalesce(${table.heightMm}, 0) >= 0`,
    ),
  ],
);

/**
 * A product's stock in one branch and department (3.x's `product.inventories`): one row per
 * product and place, null standing for no branch or no department. The plugin that keeps the
 * stock (accounting) writes it; sales, POS and loyalty read it. A row exists once stock was
 * written for the place, so a product without rows has no stock tracking, which is not the same
 * as sold out. A null amount was never set, or set to 0 (3.x unset it), and counts as 0.
 */
export const productInventories = pgTable(
  'product_inventories',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    productId: text().notNull(),
    branchId: text(),
    departmentId: text(),
    /** How many are in stock, in the product's unit. */
    remainder: doublePrecision(),
    /** Their cost, in the organisation's currency (plain decimal, as accounting keeps it). */
    cost: doublePrecision(),
    /** Ordered in, not yet received. */
    soonIn: doublePrecision(),
    /** Promised out, not yet sent. */
    soonOut: doublePrecision(),
    updatedAt: updatedAt(),
  },
  (table) => [
    // One row per place; no branch and no department count as one place each.
    unique('core_product_inventories_org_place_key')
      .on(table.orgId, table.productId, table.branchId, table.departmentId)
      .nullsNotDistinct(),
    index('core_product_inventories_org_branch_idx').on(
      table.orgId,
      table.branchId,
      table.departmentId,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_product_inventories_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.orgId, table.productId],
      foreignColumns: [products.orgId, products.id],
      name: 'core_product_inventories_product_fkey',
    }).onDelete('cascade'),
  ],
);
