import type { ProductKind, ProductStatus } from '@erxes/core-contract';
import { type Db, newId, products } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { forbidden, HttpError } from '~/http/errors';
import { diffRows } from '~/lib/changes';
import { unique } from '~/lib/contacts';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { getOrganization } from '~/modules/organizations/organizations.service';
import {
  checkCategory,
  checkImages,
  checkUnique,
  findProduct,
  pluginsFor,
  type ProductRow,
  productTaken,
} from './productChecks';
import { lookupProducts, toProductDto } from './productList';

type ProductFields = Omit<
  Partial<typeof products.$inferInsert>,
  'id' | 'orgId' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt' | 'archivedAt'
>;

/** Checks what the caller sends and returns the columns to write. `self`: the product being changed. */
const writable = async (client: Db, caller: Caller, input: ProductFields, self?: string) => {
  await checkCategory(client, caller.orgId, input.categoryId);
  await checkUnique(client, caller.orgId, input, self);

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

/** A plugin that creates a product uses it; the price is in the organisation's currency unless set. */
export const createProduct = async (
  client: Db,
  caller: Caller,
  input: ProductFields & { kind: ProductKind; name: string },
) => {
  const values = await writable(client, caller, input);
  const plugins = caller.actorType === 'plugin' ? [caller.source] : (values.plugins ?? []);
  const currency = input.currency ?? (await getOrganization(client, caller.orgId)).currency;

  try {
    const row = oneRow(
      await client
        .insert(products)
        .values({
          ...values,
          kind: input.kind,
          name: input.name,
          currency,
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
  const values = await writable(client, caller, changes, id);

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
