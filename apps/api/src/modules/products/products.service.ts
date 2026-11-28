import { type CustomValue, type ProductKind, type ProductStatus } from '@erxes/core-contract';
import { actorOf, caller, type Db, newId, organizations, products } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { diffCustomFields, diffRows, mergeChanges } from '~/lib/changes';
import { unique } from '~/lib/contacts';
import { lockRows } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { writeCoreValues } from '~/modules/dataExtensions/hostValues.service';
import { applyCustomFields } from '~/modules/fields/customValues';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { setRecordTags } from '~/modules/tags/tagLinks';
import { checkTagIds } from '~/modules/tags/tags.service';
import {
  checkCategory,
  checkImages,
  checkUnique,
  checkVariant,
  findProduct,
  pluginsFor,
  productColumns,
  type ProductRow,
} from './productChecks';
import { lookupProducts } from './productList';

type ProductFields = Omit<
  Partial<typeof products.$inferInsert>,
  'id' | 'orgId' | 'status' | 'createdBy' | 'createdAt' | 'updatedAt' | 'archivedAt'
> & {
  customFields?: Record<string, CustomValue | null>;
  tagIds?: string[];
  /** Data Extensions values by field key. */
  values?: Record<string, unknown>;
};

/**
 * Checks what the caller sends: the columns to write, and the product's
 * custom field values after the patch. `before`: the product being changed.
 */
const writable = async (
  client: Db,
  { customFields: patch, tagIds: tags, values: _values, ...input }: ProductFields,
  before?: ProductRow,
) => {
  await checkCategory(client, input.categoryId);
  await checkUnique(client, input, before?.id);

  if (input.parentId !== undefined || input.kind !== undefined) {
    const kind = input.kind ?? before?.kind;

    if (kind) {
      await checkVariant(
        client,
        {
          kind,
          parentId: input.parentId === undefined ? (before?.parentId ?? null) : input.parentId,
        },
        before,
      );
    }
  }

  const tagIds = tags === undefined ? undefined : await checkTagIds(client, 'product', tags);

  const imageIds = input.imageIds ? await checkImages(client, input.imageIds) : undefined;

  const plugins = await pluginsFor(client, input.plugins);
  const current = before?.customFields ?? {};
  const customFields = await applyCustomFields(client, 'product', current, patch);

  return {
    columns: { ...input, ...(imageIds ? { imageIds } : {}), plugins },
    customFields,
    tagIds,
    changedFields: Object.keys(patch ?? {}),
  };
};

/** What core events and audit entries say about a product change. */
const announce = async (
  client: Db,
  action: 'created' | 'updated' | 'archived' | 'restored',
  versions: { row: ProductRow; before?: ProductRow }[],
) => {
  const changed = versions.map(({ row, before }) => ({
    row,
    changes: before
      ? mergeChanges(
          diffRows(before, row, ['archivedAt', 'customFields']),
          diffCustomFields(before.customFields, row.customFields),
        )
      : null,
  }));

  await recordAudit(
    client,
    changed.map(({ row, changes }) => ({
      action: `product.${action}`,
      targetType: 'product',
      targetId: row.id,
      targetLabel: row.name,
      changes,
    })),
  );
  await publishCoreEvents(
    client,
    changed.map(({ row, changes }) => ({
      type: `core.product.${action}`,
      entityType: 'product',
      entityId: row.id,
      payload: {
        productId: row.id,
        name: row.name,
        code: row.code,
        barcode: row.barcode,
        kind: row.kind,
        status: row.status,
        categoryId: row.categoryId,
        unit: row.unit,
        price: row.price,
        currency: row.currency,
        changed: Object.keys(changes ?? {}),
      },
    })),
  );
};

/** A plugin that creates a product uses it; the price is in the organisation's currency unless set. */
export const createProduct = async (
  client: Db,
  input: ProductFields & { kind: ProductKind; name: string },
) => {
  const who = caller();

  if (input.parentId) await lockRows(client, 'core_products', [input.parentId]);

  const { columns, customFields, tagIds } = await writable(client, input);
  const plugins = who.type === 'plugin' ? [who.plugin] : (columns.plugins ?? []);

  // Row level security shows only the caller's organisation.
  const currency =
    input.currency ??
    oneRow(await client.select({ currency: organizations.currency }).from(organizations)).currency;

  const id = newId();

  await client.insert(products).values({
    ...columns,
    kind: input.kind,
    name: input.name,
    currency,
    plugins,
    id,
    createdBy: actorOf(who).actorId,
  });

  await saveCustomFields(client, 'product', id, customFields, Object.keys(customFields));

  if (input.values) await writeCoreValues(client, 'core.product', id, input.values, true);

  if (tagIds?.length) await setRecordTags(client, 'product', id, tagIds);

  const row = await findProduct(client, id);

  await announce(client, 'created', [{ row }]);

  return row;
};

const announceUpdated = async (client: Db, before: ProductRow[]) => {
  if (!before.length) return;

  const after = new Map(
    (
      await client
        .select(productColumns)
        .from(products)
        .where(
          inArray(
            products.id,
            before.map((row) => row.id),
          ),
        )
    ).map((row) => [row.id, row]),
  );

  await announce(
    client,
    'updated',
    before.flatMap((previous) => {
      const row = after.get(previous.id);

      return row ? [{ row, before: previous }] : [];
    }),
  );
};

/** Changes a product; custom fields are merged with what is stored (others' edits wait, then build on it). */
export const updateProduct = async (client: Db, id: string, changes: ProductFields) => {
  // Its item too: two changes to a product and its item take turns.
  await lockRows(client, 'core_products', changes.parentId ? [id, changes.parentId] : [id]);

  const before = await findProduct(client, id);
  const { columns, customFields, tagIds, changedFields } = await writable(client, changes, before);

  await client
    .update(products)
    .set({ ...columns, updatedAt: sql`now()` })
    .where(eq(products.id, id));

  await saveCustomFields(client, 'product', id, customFields, changedFields);

  if (changes.values) await writeCoreValues(client, 'core.product', id, changes.values);

  if (tagIds) await setRecordTags(client, 'product', id, tagIds);

  const row = await findProduct(client, id);

  await announce(client, 'updated', [{ row, before }]);

  return row;
};

/** A plugin starts or stops using products: they appear in, or leave, its lists. */
export const useProducts = async (client: Db, ids: string[], used: boolean) => {
  const { plugin } = caller('plugin');
  const wanted = unique(ids);

  await lockRows(client, 'core_products', wanted);

  const before = await client
    .select(productColumns)
    .from(products)
    .where(inArray(products.id, wanted));

  if (before.length !== wanted.length) {
    throw fail('INVALID_PRODUCT', 'Unknown product');
  }

  const changed = before.filter((row) => row.plugins.includes(plugin) !== used);

  if (changed.length) {
    const where = inArray(
      products.id,
      changed.map((row) => row.id),
    );

    await client
      .update(products)
      .set({
        plugins: used
          ? sql`array_append(${products.plugins}, ${plugin})`
          : sql`array_remove(${products.plugins}, ${plugin})`,
        updatedAt: sql`now()`,
      })
      .where(where);

    await announceUpdated(client, changed);
  }

  return lookupProducts(client, wanted);
};

const CLEAR_PAGE = 500;

export const clearCategory = async (client: Db, categoryId: string): Promise<void> => {
  const ids = (
    await client
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(products.id)
      .limit(CLEAR_PAGE)
  ).map((row) => row.id);

  if (!ids.length) return;

  await lockRows(client, 'core_products', ids);

  const before = await client
    .select(productColumns)
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.categoryId, categoryId)));

  await client
    .update(products)
    .set({ categoryId: null, updatedAt: sql`now()` })
    .where(
      inArray(
        products.id,
        before.map((row) => row.id),
      ),
    );

  await announceUpdated(client, before);

  if (ids.length === CLEAR_PAGE) await clearCategory(client, categoryId);
};

/** Archives (`archived`) or restores (`active`) a product; asking twice changes nothing. */
export const setProductStatus = async (client: Db, id: string, status: ProductStatus) => {
  const before = await findProduct(client, id);

  if (before.status === status) return before;

  await client
    .update(products)
    .set({
      status,
      archivedAt: status === 'archived' ? sql`now()` : null,
      updatedAt: sql`now()`,
    })
    .where(eq(products.id, id));

  const row = await findProduct(client, id);

  await announce(client, status === 'archived' ? 'archived' : 'restored', [{ row, before }]);

  return row;
};
