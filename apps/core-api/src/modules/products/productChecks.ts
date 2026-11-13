import { type Db, files, pluginInstallations, productCategories, products } from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { forbidden, HttpError, notFound, pgCode, pgConstraint } from '~/http/errors';
import { unique } from '~/lib/contacts';

export type ProductRow = typeof products.$inferSelect;

export const findProduct = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(products)
    .where(and(eq(products.orgId, orgId), eq(products.id, id)))
    .limit(1);

  if (!row) throw notFound('Product');

  return row;
};

/** 400 INVALID_CATEGORY unless it is one of the organisation's categories. */
export const checkCategory = async (client: Db, orgId: string, id: string | null | undefined) => {
  if (!id) return;

  const [row] = await client
    .select({ id: productCategories.id })
    .from(productCategories)
    .where(and(eq(productCategories.orgId, orgId), eq(productCategories.id, id)))
    .limit(1);

  if (!row) throw new HttpError(400, 'INVALID_CATEGORY', 'Unknown product category');
};

/** 400 INVALID_FILE unless every image is an uploaded file of the organisation. */
export const checkImages = async (client: Db, orgId: string, ids: string[] | undefined) => {
  const wanted = unique(ids ?? []);

  if (!wanted.length) return wanted;

  const found = await client
    .select({ id: files.id })
    .from(files)
    .where(and(eq(files.orgId, orgId), eq(files.status, 'ready'), inArray(files.id, wanted)));

  if (found.length !== wanted.length) {
    throw new HttpError(400, 'INVALID_FILE', 'An image is not an uploaded file');
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
  caller: Caller,
  requested: string[] | undefined,
): Promise<string[] | undefined> => {
  if (caller.actorType === 'plugin') {
    if (requested) {
      throw forbidden('FORBIDDEN', 'Plugins start or stop using products with products.use');
    }

    return undefined;
  }

  if (!requested) return undefined;

  const wanted = unique(requested);

  if (!wanted.length) return wanted;

  const installed = await client
    .select({ plugin: pluginInstallations.plugin })
    .from(pluginInstallations)
    .where(
      and(eq(pluginInstallations.orgId, caller.orgId), inArray(pluginInstallations.plugin, wanted)),
    );

  const missing = wanted.filter((name) => !installed.some((row) => row.plugin === name));

  if (missing.length) {
    throw new HttpError(400, 'PLUGIN_NOT_INSTALLED', `Not installed: ${missing.join(', ')}`);
  }

  return wanted;
};

/** 409 PRODUCT_CODE_EXISTS / PRODUCT_BARCODE_EXISTS for a code or barcode already in use. */
export const productTaken = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    const constraint = pgConstraint(error);

    if (constraint === 'core_products_org_code_key') {
      throw new HttpError(409, 'PRODUCT_CODE_EXISTS', 'Another product has this code');
    }

    if (constraint === 'core_products_org_barcode_key') {
      throw new HttpError(409, 'PRODUCT_BARCODE_EXISTS', 'Another product has this barcode');
    }
  }

  throw error;
};
