import type { ProductKind } from '@erxes/core-contract';
import {
  caller,
  type Db,
  files,
  pluginInstallations,
  productCategories,
  products,
} from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, ne, type SQL, sql } from 'drizzle-orm';
import { tagIdsColumn } from '~/modules/tags/tagLinks';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';

/** A product's columns and its tag ids. */
export const productColumns = {
  ...getTableColumns(products),
  tagIds: tagIdsColumn('product', products.id),
};

export type ProductRow = typeof products.$inferSelect & { tagIds: string[] };

export const findProduct = async (client: Db, id: string): Promise<ProductRow> => {
  const [row] = await client
    .select(productColumns)
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!row) throw notFound('Product');

  return row;
};

/** 400 INVALID_CATEGORY unless it is one of the organisation's categories. */
export const checkCategory = async (client: Db, id: string | null | undefined) => {
  if (!id) return;

  const [row] = await client
    .select({ id: productCategories.id })
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .limit(1);

  if (!row) throw fail('INVALID_CATEGORY', 'Unknown product category');
};

/** 400 INVALID_FILE unless every image is an uploaded file of the organisation. */
export const checkImages = async (client: Db, ids: string[] | undefined) => {
  const wanted = unique(ids ?? []);

  if (!wanted.length) return wanted;

  const found = await client
    .select({ id: files.id })
    .from(files)
    .where(and(eq(files.status, 'ready'), inArray(files.id, wanted)));

  if (found.length !== wanted.length) {
    throw fail('INVALID_FILE', 'An image is not an uploaded file');
  }

  return wanted;
};

/**
 * The plugins that use a product, as the caller sets them. Members name
 * installed plugins (400 PLUGIN_NOT_INSTALLED). Plugins never set the list
 * (403 FORBIDDEN): they call `products.use` for themselves, and the one that
 * creates a product uses it.
 */
export const pluginsFor = async (
  client: Db,
  requested: string[] | undefined,
): Promise<string[] | undefined> => {
  if (caller().type === 'plugin') {
    if (requested) {
      throw fail('NOT_ALLOWED', 'Plugins start or stop using products with products.use');
    }

    return undefined;
  }

  if (!requested) return undefined;

  const wanted = unique(requested);

  if (!wanted.length) return wanted;

  const installed = await client
    .select({ plugin: pluginInstallations.plugin })
    .from(pluginInstallations)
    .where(inArray(pluginInstallations.plugin, wanted));

  const missing = wanted.filter((name) => !installed.some((row) => row.plugin === name));

  if (missing.length) {
    throw fail('PLUGIN_NOT_INSTALLED', `Not installed: ${missing.join(', ')}`);
  }

  return wanted;
};

/**
 * 409 TAKEN when another product has the code or barcode, with its id
 * (`data.id`): a plugin syncing its
 * own catalog starts using that product instead of making a copy.
 */
export const checkUnique = async (
  client: Db,
  input: { code?: string | null; barcode?: string | null },
  self?: string,
) => {
  const same = (match: SQL) =>
    client
      .select({ id: products.id })
      .from(products)
      .where(and(match, self ? ne(products.id, self) : undefined))
      .limit(1)
      .then(([row]) => row?.id);

  const byCode = input.code
    ? await same(sql`lower(${products.code}) = lower(${input.code})`)
    : undefined;

  if (byCode) {
    throw fail('TAKEN', 'Another product has this code', { field: 'code', id: byCode });
  }

  const byBarcode = input.barcode ? await same(eq(products.barcode, input.barcode)) : undefined;

  if (byBarcode) {
    throw fail('TAKEN', 'Another product has this barcode', { field: 'barcode', id: byBarcode });
  }
};

/**
 * 400 INVALID_PRODUCT unless the product may be what it becomes: a variant's
 * item is an active product of the same kind that is not a variant itself,
 * and a product with variants is never a variant (one level deep) and keeps
 * its variants' kind. The caller has locked the product and its item.
 */
export const checkVariant = async (
  client: Db,
  next: { kind: ProductKind; parentId: string | null },
  self?: ProductRow,
) => {
  if (next.parentId) {
    const [item] = await client
      .select({ kind: products.kind, status: products.status, parentId: products.parentId })
      .from(products)
      .where(eq(products.id, next.parentId))
      .limit(1);

    if (!item || item.status !== 'active') {
      throw fail('INVALID_PRODUCT', 'A variant belongs to an active product');
    }

    if (item.parentId) {
      throw fail('INVALID_PRODUCT', 'That product is a variant itself');
    }

    if (item.kind !== next.kind) {
      throw fail('INVALID_PRODUCT', 'A variant is the same kind as its product');
    }
  }

  if (!self || (next.parentId === null && next.kind === self.kind)) return;

  const [variant] = await client
    .select({ id: products.id })
    .from(products)
    .where(eq(products.parentId, self.id))
    .limit(1);

  if (variant && next.parentId) {
    throw fail('INVALID_PRODUCT', 'A product with variants is not a variant itself');
  }

  if (variant && next.kind !== self.kind) {
    throw fail('INVALID_PRODUCT', 'A product with variants keeps their kind');
  }
};
