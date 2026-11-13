import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, IdList, QueryBoolean } from './common';
import { PluginName } from './plugins';

export const ProductKind = z.enum(['goods', 'service']);

export type ProductKind = z.infer<typeof ProductKind>;

export const ProductStatus = z.enum(['active', 'archived']);

export type ProductStatus = z.infer<typeof ProductStatus>;

/**
 * One item of the organisation's shared catalog. Every plugin points at the
 * same product id; what only one plugin needs (stock, storefront pages,
 * delivery rules) stays in that plugin, keyed by the id.
 */
export const Product = z.object({
  id: Id,
  kind: ProductKind,
  status: ProductStatus,
  name: z.string(),
  code: z.string().nullable(),
  barcode: z.string().nullable(),
  categoryId: Id.nullable(),
  description: z.string().nullable(),
  unit: z.string(),
  /** Hundredths of the currency unit (₮1,500 → 150000), like invoices. */
  price: z.number().int(),
  currency: z.string(),
  /** Core file ids; the first is the main image. */
  imageIds: z.array(Id),
  weightGrams: z.number().int().nullable(),
  lengthMm: z.number().int().nullable(),
  widthMm: z.number().int().nullable(),
  heightMm: z.number().int().nullable(),
  /** The plugins that use it (`ecom`, `tms`); each lists its own by default. */
  plugins: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  archivedAt: z.string().datetime().nullable(),
});

export type Product = z.infer<typeof Product>;

export const ProductCategory = z.object({
  id: Id,
  name: z.string(),
  parentId: Id.nullable(),
  createdAt: z.string().datetime(),
});

export type ProductCategory = z.infer<typeof ProductCategory>;

const size = z.number().int().min(0).max(100_000_000).nullable();

const ProductFields = z.object({
  kind: ProductKind,
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(100).nullable(),
  barcode: z.string().trim().min(1).max(100).nullable(),
  categoryId: Id.nullable(),
  description: z.string().trim().max(10_000).nullable(),
  unit: z.string().trim().min(1).max(20),
  price: z.number().int().min(0).max(1_000_000_000_00),
  currency: z.literal('MNT'),
  imageIds: z.array(Id).max(20),
  weightGrams: size,
  lengthMm: size,
  widthMm: size,
  heightMm: size,
  /** Members choose the plugins that use it; a plugin that creates a product uses it itself. */
  plugins: z.array(PluginName).max(50),
});

/**
 * The organisation's catalog of goods and services, shared by every plugin.
 * Products are archived, never deleted: orders and invoices keep pointing at
 * them. Plugins read with `products:read` and write with `products:write`.
 */
export const productsContract = {
  list: oc
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
        categoryId: Id.optional(),
        plugin: PluginName.optional(),
        all: QueryBoolean.default(false),
      }),
    )
    .output(cursorPageOf(Product)),
  get: oc
    .route({ method: 'GET', path: '/products/{id}' })
    .input(z.object({ id: Id }))
    .output(Product),
  lookup: oc
    .route({
      method: 'GET',
      path: '/products/lookup',
      summary: 'The given products (archived ones too), for order lines: `?ids=a,b`, at most 100',
    })
    .input(z.object({ ids: IdList }))
    .output(z.object({ data: z.array(Product) })),
  create: oc
    .route({
      method: 'POST',
      path: '/products',
      successStatus: 201,
      summary:
        'Add a product. 409 PRODUCT_CODE_EXISTS / PRODUCT_BARCODE_EXISTS; 400 INVALID_CATEGORY, INVALID_FILE, PLUGIN_NOT_INSTALLED',
    })
    .input(
      ProductFields.partial({
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
      }),
    )
    .output(Product),
  update: oc
    .route({
      method: 'PATCH',
      path: '/products/{id}',
      summary: 'Change a product (`plugins`: members only). Errors as for create',
    })
    .input(
      ProductFields.partial()
        .extend({ id: Id })
        .refine((value) => Object.keys(value).some((key) => key !== 'id'), 'nothing to update'),
    )
    .output(Product),
  use: oc
    .route({
      method: 'POST',
      path: '/products/use',
      summary:
        'A plugin starts (`used`) or stops using products, so they appear in its lists (plugins only)',
    })
    .input(z.object({ ids: z.array(Id).min(1).max(100), used: z.boolean() }))
    .output(z.object({ data: z.array(Product) })),
  archive: oc
    .route({
      method: 'POST',
      path: '/products/{id}/archive',
      summary: 'Take a product out of lists and pickers; orders and invoices keep it',
    })
    .input(z.object({ id: Id }))
    .output(Product),
  restore: oc
    .route({ method: 'POST', path: '/products/{id}/restore' })
    .input(z.object({ id: Id }))
    .output(Product),
};

/** Groups of products, nested by `parentId`. */
export const productCategoriesContract = {
  list: oc
    .route({ method: 'GET', path: '/product-categories', summary: 'Every category, by name' })
    .output(z.object({ data: z.array(ProductCategory) })),
  create: oc
    .route({
      method: 'POST',
      path: '/product-categories',
      successStatus: 201,
      summary: '409 CATEGORY_EXISTS (same name under the same parent); 400 INVALID_CATEGORY',
    })
    .input(
      z.object({ name: z.string().trim().min(1).max(100), parentId: Id.nullable().optional() }),
    )
    .output(ProductCategory),
  update: oc
    .route({
      method: 'PATCH',
      path: '/product-categories/{id}',
      summary: '409 CATEGORY_EXISTS; 400 INVALID_CATEGORY (unknown parent, or one of its own)',
    })
    .input(
      z
        .object({
          id: Id,
          name: z.string().trim().min(1).max(100).optional(),
          parentId: Id.nullable().optional(),
        })
        .refine((value) => Object.keys(value).some((key) => key !== 'id'), 'nothing to update'),
    )
    .output(ProductCategory),
  remove: oc
    .route({
      method: 'DELETE',
      path: '/product-categories/{id}',
      summary:
        'Delete an empty category; its products lose it. 409 CATEGORY_HAS_CHILDREN while it has subcategories',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
};
