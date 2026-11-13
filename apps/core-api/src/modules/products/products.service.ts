import type { CustomValue, ProductKind, ProductStatus } from '@erxes/core-contract';
import { type Db, newId, products } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { forbidden, HttpError } from '~/http/errors';
import { diffCustomFields, diffRows, mergeChanges } from '~/lib/changes';
import { unique } from '~/lib/contacts';
import { lockRows } from '~/lib/locks';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { applyCustomFields } from '~/modules/fields/customValues';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { getOrganization } from '~/modules/organizations/organizations.service';
import {
  checkCategory,
  checkImages,
  checkUnique,
  findProduct,
  pluginsFor,
  productColumns,
  type ProductRow,
  productTaken,
} from './productChecks';
import { lookupProducts, toProductDto } from './productList';

type ProductFields = Omit<
  Partial<typeof products.$inferInsert>,
  'id' | 'orgId' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt' | 'archivedAt'
> & { customFields?: Record<string, CustomValue | null> };

/**
 * Checks what the caller sends: the columns to write, and the product's
 * custom field values after the patch. `before`: the product being changed.
 */
const writable = async (
  client: Db,
  caller: Caller,
  { customFields: patch, ...input }: ProductFields,
  before?: ProductRow,
) => {
  await checkCategory(client, caller.orgId, input.categoryId);
  await checkUnique(client, caller.orgId, input, before?.id);

  const imageIds = input.imageIds
    ? await checkImages(client, caller.orgId, input.imageIds)
    : undefined;

  const plugins = await pluginsFor(client, caller, input.plugins);
  const current = before?.customFields ?? {};
  const customFields = await applyCustomFields(client, caller.orgId, 'product', current, patch);

  return {
    columns: { ...input, ...(imageIds ? { imageIds } : {}), plugins },
    customFields,
    changedFields: Object.keys(patch ?? {}),
  };
};

/** What core events and audit entries say about a product change. */
const announce = async (
  client: Db,
  caller: Caller,
  action: 'created' | 'updated' | 'archived' | 'restored',
  row: ProductRow,
  before?: ProductRow,
) => {
  const changes = before
    ? mergeChanges(
        diffRows(before, row, ['archivedAt', 'customFields']),
        diffCustomFields(before.customFields, row.customFields),
      )
    : null;

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
  const { columns, customFields } = await writable(client, caller, input);
  const plugins = caller.actorType === 'plugin' ? [caller.source] : (columns.plugins ?? []);
  const currency = input.currency ?? (await getOrganization(client, caller.orgId)).currency;
  const id = newId();

  try {
    await client.insert(products).values({
      ...columns,
      kind: input.kind,
      name: input.name,
      currency,
      plugins,
      id,
      orgId: caller.orgId,
      createdBy: caller.actorId,
    });
  } catch (error) {
    return productTaken(error);
  }

  await saveCustomFields(
    client,
    caller.orgId,
    'product',
    id,
    customFields,
    Object.keys(customFields),
  );

  const row = await findProduct(client, caller.orgId, id);

  await announce(client, caller, 'created', row);

  return toProductDto(row);
};

/** Changes a product; custom fields are merged with what is stored (others' edits wait, then build on it). */
export const updateProduct = async (
  client: Db,
  caller: Caller,
  id: string,
  changes: ProductFields,
) => {
  await lockRows(client, 'core_products', caller.orgId, [id]);

  const before = await findProduct(client, caller.orgId, id);
  const { columns, customFields, changedFields } = await writable(client, caller, changes, before);

  try {
    await client
      .update(products)
      .set({ ...columns, updatedAt: sql`now()` })
      .where(and(eq(products.orgId, caller.orgId), eq(products.id, id)));
  } catch (error) {
    return productTaken(error);
  }

  await saveCustomFields(client, caller.orgId, 'product', id, customFields, changedFields);

  const row = await findProduct(client, caller.orgId, id);

  await announce(client, caller, 'updated', row, before);

  return toProductDto(row);
};

/** A plugin starts or stops using products: they appear in, or leave, its lists. */
export const useProducts = async (client: Db, caller: Caller, ids: string[], used: boolean) => {
  if (caller.actorType !== 'plugin') {
    throw forbidden('FORBIDDEN', 'Members choose plugins on the product itself');
  }

  const wanted = unique(ids);

  await lockRows(client, 'core_products', caller.orgId, wanted);

  const before = await client
    .select(productColumns)
    .from(products)
    .where(and(eq(products.orgId, caller.orgId), inArray(products.id, wanted)));

  if (before.length !== wanted.length) {
    throw new HttpError(400, 'INVALID_PRODUCT', 'Unknown product');
  }

  const plugin = caller.source;
  const changed = before.filter((row) => row.plugins.includes(plugin) !== used);

  if (changed.length) {
    await client
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
      );
  }

  for (const previous of changed) {
    await announce(
      client,
      caller,
      'updated',
      await findProduct(client, caller.orgId, previous.id),
      previous,
    );
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

  await client
    .update(products)
    .set({
      status,
      archivedAt: status === 'archived' ? sql`now()` : null,
      updatedAt: sql`now()`,
    })
    .where(and(eq(products.orgId, caller.orgId), eq(products.id, id)));

  const row = await findProduct(client, caller.orgId, id);

  await announce(client, caller, status === 'archived' ? 'archived' : 'restored', row, before);

  return toProductDto(row);
};
