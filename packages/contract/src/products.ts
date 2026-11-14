import { PRODUCT_STATUSES } from '@erxes/core-db/enums';
import { productCategories, products } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { ProductKind } from './values';
import {
  CursorQuery,
  CustomFields,
  CustomFieldsPatch,
  cursorPageOf,
  Id,
  IdList,
  isoDate,
  listOf,
  QueryBoolean,
} from './common';
import { Currency } from './money';
import { PluginName } from './plugins';

export const ProductStatus = z.enum(PRODUCT_STATUSES);

export type ProductStatus = z.infer<typeof ProductStatus>;

/**
 * One item of the organisation's shared catalog. Every plugin points at the
 * same product id; what only one plugin needs (stock, storefront pages,
 * delivery rules) stays in that plugin, keyed by the id.
 */
const int = () => z.int();

export const Product = createSelectSchema(products, {
  id: Id,
  categoryId: () => Id,
  price: int,
  imageIds: () => z.array(Id),
  weightGrams: int,
  lengthMm: int,
  widthMm: int,
  heightMm: int,
  createdAt: isoDate,
  updatedAt: isoDate,
  archivedAt: isoDate,
})
  .pick({
    id: true,
    kind: true,
    status: true,
    name: true,
    code: true,
    barcode: true,
    categoryId: true,
    description: true,
    unit: true,
    /** In the currency's smallest unit ($12.50 → 1250, ₮1,500 → 150000), like invoices. */
    price: true,
    /** ISO 4217; the organisation's currency unless set. */
    currency: true,
    /** Core file ids; the first is the main image. */
    imageIds: true,
    weightGrams: true,
    lengthMm: true,
    widthMm: true,
    heightMm: true,
    /** The plugins that use it (`ecom`, `tms`); each lists its own by default. */
    plugins: true,
    createdAt: true,
    updatedAt: true,
    archivedAt: true,
  })
  .extend({
    /**
     * The organisation's own product properties (brand, warranty, room
     * capacity), set up in Settings › Properties, by field id. Every plugin
     * sees them; what only one plugin needs stays in that plugin.
     */
    customFields: CustomFields,
  });

export type Product = z.infer<typeof Product>;

export const ProductCategory = createSelectSchema(productCategories, {
  id: Id,
  parentId: () => Id,
  createdAt: isoDate,
}).pick({ id: true, name: true, parentId: true, createdAt: true });

export type ProductCategory = z.infer<typeof ProductCategory>;

const size = () => z.int().min(0).max(100_000_000);

/** What a create or update may set; every field is optional here. */
const ProductFields = createUpdateSchema(products, {
  name: (name) => name.trim().min(1).max(200),
  code: (code) => code.trim().min(1).max(100),
  barcode: (barcode) => barcode.trim().min(1).max(100),
  categoryId: () => Id,
  description: (value) => value.trim().max(10_000),
  unit: (unit) => unit.trim().min(1).max(20),
  price: () => z.int().min(0).max(1_000_000_000_00),
  currency: () => Currency,
  imageIds: () => z.array(Id).max(20),
  weightGrams: size,
  lengthMm: size,
  widthMm: size,
  heightMm: size,
  /** Members choose the plugins that use it; a plugin that creates a product uses it itself. */
  plugins: () => z.array(PluginName).max(50),
})
  .pick({
    kind: true,
    name: true,
    code: true,
    barcode: true,
    categoryId: true,
    description: true,
    unit: true,
    price: true,
    currency: true,
    imageIds: true,
    weightGrams: true,
    lengthMm: true,
    widthMm: true,
    heightMm: true,
    plugins: true,
  })
  .extend({
    /** Values by field id; `null` or empty clears one, fields left out stay. 400 INVALID_FIELD, INVALID_FIELD_VALUE. */
    customFields: CustomFieldsPatch.optional(),
  });

const CategoryFields = createUpdateSchema(productCategories, {
  name: (name) => name.trim().min(1).max(100),
  parentId: () => Id,
}).pick({ name: true, parentId: true });

/**
 * The organisation's catalog of goods and services, shared by every plugin.
 * Products are archived, never deleted: orders and invoices keep pointing at
 * them. Plugins read with `products:read` and write with `products:write`.
 */
const {
  CATEGORY_HAS_CHILDREN,
  INVALID_CATEGORY,
  INVALID_FIELD,
  INVALID_FIELD_VALUE,
  INVALID_FILE,
  INVALID_PRODUCT,
  LIMIT_EXCEEDED,
  NOTHING_TO_RETRY,
  PLUGIN_NOT_INSTALLED,
  SUBJECT_REQUIRED,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  CATEGORY_HAS_CHILDREN,
  INVALID_CATEGORY,
  INVALID_FIELD,
  INVALID_FIELD_VALUE,
  INVALID_FILE,
  INVALID_PRODUCT,
  LIMIT_EXCEEDED,
  NOTHING_TO_RETRY,
  PLUGIN_NOT_INSTALLED,
  SUBJECT_REQUIRED,
});

export const productsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/products',
      summary:
        'Products, newest first. A plugin gets the products it uses unless `all`; members filter by `plugin`',
    })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        kind: ProductKind.optional(),
        status: ProductStatus.default('active'),
        /** That category and its subcategories. */
        categoryId: Id.optional(),
        plugin: PluginName.optional(),
        all: QueryBoolean.default(false),
        /** A filter on `views.fields({ recordType: 'product' })`: JSON of a condition group (`RecordFilter`), as views save it. */
        filter: z.string().max(20_000).optional(),
      }),
    )
    .output(cursorPageOf(Product)),
  get: base
    .route({ method: 'GET', path: '/products/{id}' })
    .input(z.object({ id: Id }))
    .output(Product),
  lookup: base
    .route({
      method: 'GET',
      path: '/products/lookup',
      summary: 'The given products (archived ones too), for order lines: `?ids=a,b`, at most 100',
    })
    .input(z.object({ ids: IdList }))
    .output(z.object({ data: z.array(Product).max(100) })),
  create: base
    .route({
      method: 'POST',
      path: '/products',
      successStatus: 201,
      summary:
        "Add a product. 409 PRODUCT_CODE_EXISTS / PRODUCT_BARCODE_EXISTS with the existing product's id in `data.productId` (a plugin can `use` it instead); 400 INVALID_CATEGORY, INVALID_FILE, PLUGIN_NOT_INSTALLED",
    })
    .input(ProductFields.required({ kind: true, name: true }))
    .output(Product),
  update: base
    .route({
      method: 'PATCH',
      path: '/products/{id}',
      summary: 'Change a product (`plugins`: members only). Errors as for create',
    })
    .input(
      ProductFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(Product),
  use: base
    .route({
      method: 'POST',
      path: '/products/use',
      summary:
        'A plugin starts (`used`) or stops using products, so they appear in its lists (plugins only)',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(100), used: z.boolean() }))
    .output(z.object({ data: z.array(Product).max(100) })),
  archive: base
    .route({
      method: 'POST',
      path: '/products/{id}/archive',
      summary: 'Take a product out of lists and pickers; orders and invoices keep it',
    })
    .input(z.object({ id: Id }))
    .output(Product),
  restore: base
    .route({ method: 'POST', path: '/products/{id}/restore' })
    .input(z.object({ id: Id }))
    .output(Product),
};

/** Groups of products, nested by `parentId`. */
export const productCategoriesContract = {
  list: base
    .route({ method: 'GET', path: '/product-categories', summary: 'Every category, by name' })
    .output(listOf(ProductCategory)),
  create: base
    .route({
      method: 'POST',
      path: '/product-categories',
      successStatus: 201,
      summary: '409 CATEGORY_EXISTS (same name under the same parent); 400 INVALID_CATEGORY',
    })
    .input(CategoryFields.required({ name: true }))
    .output(ProductCategory),
  update: base
    .route({
      method: 'PATCH',
      path: '/product-categories/{id}',
      summary: '409 CATEGORY_EXISTS; 400 INVALID_CATEGORY (unknown parent, or one of its own)',
    })
    .input(
      CategoryFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(ProductCategory),
  remove: base
    .route({
      method: 'DELETE',
      path: '/product-categories/{id}',
      summary:
        'Delete an empty category; its products lose it. 409 CATEGORY_HAS_CHILDREN while it has subcategories',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
