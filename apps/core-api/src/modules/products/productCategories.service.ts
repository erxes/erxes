import type { ProductCategory } from '@erxes/core-contract';
import { type Db, newId, productCategories, products } from '@erxes/core-db';
import { and, asc, eq, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import type { Caller } from '~/http/auth';
import { HttpError, notFound, pgCode } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { checkCategory } from './productChecks';

type CategoryRow = typeof productCategories.$inferSelect;

const toCategoryDto = (row: CategoryRow): ProductCategory => ({
  id: row.id,
  name: row.name,
  parentId: row.parentId,
  createdAt: row.createdAt.toISOString(),
});

const taken = (error: unknown): never => {
  if (pgCode(error) === '23505') {
    throw new HttpError(409, 'CATEGORY_EXISTS', 'A category with this name is already there');
  }

  throw error;
};

const findCategory = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(productCategories)
    .where(and(eq(productCategories.orgId, orgId), eq(productCategories.id, id)))
    .limit(1);

  if (!row) throw notFound('Product category');

  return row;
};

/** 400 INVALID_CATEGORY when `parentId` is the category itself or one under it. */
const checkNotUnder = async (client: Db, orgId: string, id: string, parentId: string) => {
  const result = await client.execute<{ id: string }>(sql`
    WITH RECURSIVE ancestors(id, parent_id) AS (
      SELECT id, parent_id FROM ${productCategories} WHERE org_id = ${orgId} AND id = ${parentId}
      UNION
      SELECT c.id, c.parent_id FROM ${productCategories} c
        JOIN ancestors a ON c.id = a.parent_id AND c.org_id = ${orgId}
    )
    SELECT id FROM ancestors WHERE id = ${id}
  `);

  if (result.rows.length) {
    throw new HttpError(400, 'INVALID_CATEGORY', 'A category can’t go under itself');
  }
};

export const listCategories = async (client: Db, caller: Caller) => {
  const rows = await wholeList((limit) =>
    client
      .select()
      .from(productCategories)
      .where(eq(productCategories.orgId, caller.orgId))
      .orderBy(asc(sql`lower(${productCategories.name})`))
      .limit(limit),
  );

  return { data: rows.map(toCategoryDto) };
};

export const createCategory = async (
  client: Db,
  caller: Caller,
  input: { name: string; parentId?: string | null },
) => {
  await checkCategory(client, caller.orgId, input.parentId);

  try {
    const row = oneRow(
      await client
        .insert(productCategories)
        .values({
          id: newId(),
          name: input.name,
          parentId: input.parentId ?? null,
          createdBy: caller.actorId,
        })
        .returning(),
    );

    await recordAudit(client, caller, {
      action: 'product_category.created',
      targetType: 'product_category',
      targetId: row.id,
      targetLabel: row.name,
    });

    return toCategoryDto(row);
  } catch (error) {
    return taken(error);
  }
};

export const updateCategory = async (
  client: Db,
  caller: Caller,
  id: string,
  changes: { name?: string; parentId?: string | null },
) => {
  await findCategory(client, caller.orgId, id);

  if (changes.parentId) {
    await checkCategory(client, caller.orgId, changes.parentId);
    await checkNotUnder(client, caller.orgId, id, changes.parentId);
  }

  try {
    const row = oneRow(
      await client
        .update(productCategories)
        .set({ ...changes, updatedAt: sql`now()` })
        .where(and(eq(productCategories.orgId, caller.orgId), eq(productCategories.id, id)))
        .returning(),
    );

    await recordAudit(client, caller, {
      action: 'product_category.updated',
      targetType: 'product_category',
      targetId: row.id,
      targetLabel: row.name,
    });

    return toCategoryDto(row);
  } catch (error) {
    return taken(error);
  }
};

/** Deletes a category without subcategories (409 CATEGORY_HAS_CHILDREN); its products lose it. */
export const removeCategory = async (client: Db, caller: Caller, id: string) => {
  const row = await findCategory(client, caller.orgId, id);

  const [child] = await client
    .select({ id: productCategories.id })
    .from(productCategories)
    .where(and(eq(productCategories.orgId, caller.orgId), eq(productCategories.parentId, id)))
    .limit(1);

  if (child) {
    throw new HttpError(409, 'CATEGORY_HAS_CHILDREN', 'Move or delete its subcategories first');
  }

  await client
    .update(products)
    .set({ categoryId: null, updatedAt: sql`now()` })
    .where(and(eq(products.orgId, caller.orgId), eq(products.categoryId, id)));
  await client
    .delete(productCategories)
    .where(and(eq(productCategories.orgId, caller.orgId), eq(productCategories.id, id)));
  await recordAudit(client, caller, {
    action: 'product_category.deleted',
    targetType: 'product_category',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
};
