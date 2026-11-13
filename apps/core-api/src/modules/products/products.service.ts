import type { CursorQuery, Product, ProductKind, ProductStatus } from '@erxes/core-contract';
import { type Db, newId, products } from '@erxes/core-db';
import { and, arrayContains, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { forbidden, HttpError } from '~/http/errors';
import { diffRows } from '~/lib/changes';
import { unique } from '~/lib/contacts';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import {
  checkCategory,
  checkImages,
  findProduct,
  pluginsFor,
  type ProductRow,
  productTaken,
} from './productChecks';

const toProductDto = (row: ProductRow): Product => ({
  id: row.id,
  kind: row.kind,
  status: row.status,
  name: row.name,
  code: row.code,
  barcode: row.barcode,
  categoryId: row.categoryId,
  description: row.description,
  unit: row.unit,
  price: row.price,
  currency: row.currency,
  imageIds: row.imageIds,
  weightGrams: row.weightGrams,
  lengthMm: row.lengthMm,
  widthMm: row.widthMm,
  heightMm: row.heightMm,
  plugins: row.plugins,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  archivedAt: row.archivedAt?.toISOString() ?? null,
});

interface ProductQuery {
  search?: string;
  kind?: ProductKind;
  status: ProductStatus;
  categoryId?: string;
  plugin?: string;
  all: boolean;
}

/** A plugin lists the products it uses unless it asks for `all`; members may filter by plugin. */
const usedBy = (caller: Caller, query: ProductQuery) => {
  const plugin = caller.actorType === 'plugin' && !query.all ? caller.source : query.plugin;

  return plugin ? arrayContains(products.plugins, [plugin]) : undefined;
};

export const listProducts = async (
  client: Db,
  caller: Caller,
  query: CursorQuery & ProductQuery,
) => {
  const search = query.search ? containsPattern(query.search) : undefined;

  const page = await keysetPage(
    client,
    {
      table: products,
      id: products.id,
      createdAt: products.createdAt,
      scope: eq(products.orgId, caller.orgId),
    },
    and(
      eq(products.status, query.status),
      query.kind ? eq(products.kind, query.kind) : undefined,
      query.categoryId ? eq(products.categoryId, query.categoryId) : undefined,
      usedBy(caller, query),
      search && query.search
        ? or(
            ilike(products.name, search),
            ilike(products.code, search),
            eq(products.barcode, query.search),
          )
        : undefined,
    ),
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(products)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toProductDto) };
};

export const getProduct = async (client: Db, caller: Caller, id: string) =>
  toProductDto(await findProduct(client, caller.orgId, id));

/** The given products in the order asked, archived ones too; unknown ids are left out. */
export const lookupProducts = async (client: Db, caller: Caller, ids: string[]) => {
  const wanted = unique(ids);

  const rows = wanted.length
    ? await client
        .select()
        .from(products)
        .where(and(eq(products.orgId, caller.orgId), inArray(products.id, wanted)))
    : [];

  const byId = new Map(rows.map((row) => [row.id, toProductDto(row)]));

  return { data: wanted.flatMap((id) => byId.get(id) ?? []) };
};

type ProductFields = Omit<
  Partial<typeof products.$inferInsert>,
  'id' | 'orgId' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt' | 'archivedAt'
>;

/** Checks what the caller sends and returns the columns to write. */
const writable = async (client: Db, caller: Caller, input: ProductFields) => {
  await checkCategory(client, caller.orgId, input.categoryId);

  const imageIds = input.imageIds
    ? await checkImages(client, caller.orgId, input.imageIds)
    : undefined;

  const plugins = await pluginsFor(client, caller, input.plugins);

  return { ...input, ...(imageIds ? { imageIds } : {}), plugins };
};

/** What core events and audit entries say about a product change. */
const announce = async (
  client: Db,
  caller: Caller,
  action: 'created' | 'updated' | 'archived' | 'restored',
  row: ProductRow,
  before?: ProductRow,
) => {
  const changes = before ? diffRows(before, row, ['archivedAt']) : null;

  await recordAudit(client, caller, {
    action: `product.${action}`,
    targetType: 'product',
    targetId: row.id,
    targetLabel: row.name,
    changes,
  });
  await publishCoreEvents(client, caller, {
    type: `core.product.${action}`,
    entity: { type: 'product', id: row.id },
    payload: { product: toProductDto(row), changed: Object.keys(changes ?? {}) },
  });
};

export const createProduct = async (
  client: Db,
  caller: Caller,
  input: ProductFields & { kind: ProductKind; name: string },
) => {
  const values = await writable(client, caller, input);
  const plugins = caller.actorType === 'plugin' ? [caller.source] : (values.plugins ?? []);

  try {
    const row = oneRow(
      await client
        .insert(products)
        .values({
          ...values,
          kind: input.kind,
          name: input.name,
          plugins,
          id: newId(),
          orgId: caller.orgId,
          createdBy: caller.actorId,
        })
        .returning(),
    );

    await announce(client, caller, 'created', row);

    return toProductDto(row);
  } catch (error) {
    return productTaken(error);
  }
};

export const updateProduct = async (
  client: Db,
  caller: Caller,
  id: string,
  changes: ProductFields,
) => {
  const before = await findProduct(client, caller.orgId, id);
  const values = await writable(client, caller, changes);

  try {
    const row = oneRow(
      await client
        .update(products)
        .set({ ...values, updatedAt: sql`now()` })
        .where(and(eq(products.orgId, caller.orgId), eq(products.id, id)))
        .returning(),
    );

    await announce(client, caller, 'updated', row, before);

    return toProductDto(row);
  } catch (error) {
    return productTaken(error);
  }
};

/** A plugin starts or stops using products: they appear in, or leave, its lists. */
export const useProducts = async (client: Db, caller: Caller, ids: string[], used: boolean) => {
  if (caller.actorType !== 'plugin') {
    throw forbidden('FORBIDDEN', 'Members choose plugins on the product itself');
  }

  const wanted = unique(ids);

  const before = await client
    .select()
    .from(products)
    .where(and(eq(products.orgId, caller.orgId), inArray(products.id, wanted)));

  if (before.length !== wanted.length) {
    throw new HttpError(400, 'INVALID_PRODUCT', 'Unknown product');
  }

  const plugin = caller.source;
  const changed = before.filter((row) => row.plugins.includes(plugin) !== used);

  const rows = changed.length
    ? await client
        .update(products)
        .set({
          plugins: used
            ? sql`array_append(${products.plugins}, ${plugin})`
            : sql`array_remove(${products.plugins}, ${plugin})`,
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(products.orgId, caller.orgId),
            inArray(
              products.id,
              changed.map((row) => row.id),
            ),
          ),
        )
        .returning()
    : [];

  for (const row of rows) {
    const previous = before.find((item) => item.id === row.id);

    await announce(client, caller, 'updated', row, previous);
  }

  return lookupProducts(client, caller, wanted);
};

/** Archives (`archived`) or restores (`active`) a product; asking twice changes nothing. */
export const setProductStatus = async (
  client: Db,
  caller: Caller,
  id: string,
  status: ProductStatus,
) => {
  const before = await findProduct(client, caller.orgId, id);

  if (before.status === status) return toProductDto(before);

  const row = oneRow(
    await client
      .update(products)
      .set({
        status,
        archivedAt: status === 'archived' ? sql`now()` : null,
        updatedAt: sql`now()`,
      })
      .where(and(eq(products.orgId, caller.orgId), eq(products.id, id)))
      .returning(),
  );

  await announce(client, caller, status === 'archived' ? 'archived' : 'restored', row, before);

  return toProductDto(row);
};
