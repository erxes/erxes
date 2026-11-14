import { actorOf, caller, type Db, newId, productCategories, products } from '@erxes/core-db';
import { asc, eq, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { fail, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { checkCategory } from './productChecks';

const findCategory = async (client: Db, id: string) => {
  const [row] = await client
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .limit(1);

  if (!row) throw notFound('Product category');

  return row;
};

/** 400 INVALID_CATEGORY when `parentId` is the category itself or one under it. */
const checkNotUnder = async (client: Db, id: string, parentId: string) => {
  const result = await client.execute<{ id: string }>(sql`
    WITH RECURSIVE ancestors(id, parent_id) AS (
      SELECT id, parent_id FROM ${productCategories} WHERE id = ${parentId}
      UNION
      SELECT c.id, c.parent_id FROM ${productCategories} c
        JOIN ancestors a ON c.id = a.parent_id
    )
    SELECT id FROM ancestors WHERE id = ${id}
  `);

  if (result.rows.length) {
    throw fail('INVALID_CATEGORY', 'A category can’t go under itself');
  }
};

export const listCategories = async (client: Db) => {
  const rows = await wholeList((limit) =>
    client
      .select()
      .from(productCategories)
      .orderBy(asc(sql`lower(${productCategories.name})`))
      .limit(limit),
  );

  return { data: rows };
};

export const createCategory = async (
  client: Db,
  input: { name: string; parentId?: string | null },
) => {
  await checkCategory(client, input.parentId);

  const row = oneRow(
    await client
      .insert(productCategories)
      .values({
        id: newId(),
        name: input.name,
        parentId: input.parentId ?? null,
        createdBy: actorOf(caller()).actorId,
      })
      .returning(),
  );

  await recordAudit(client, {
    action: 'product_category.created',
    targetType: 'product_category',
    targetId: row.id,
    targetLabel: row.name,
  });

  return row;
};

export const updateCategory = async (
  client: Db,
  id: string,
  changes: { name?: string; parentId?: string | null },
) => {
  await findCategory(client, id);

  if (changes.parentId) {
    await checkCategory(client, changes.parentId);
    await checkNotUnder(client, id, changes.parentId);
  }

  const row = oneRow(
    await client
      .update(productCategories)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(productCategories.id, id))
      .returning(),
  );

  await recordAudit(client, {
    action: 'product_category.updated',
    targetType: 'product_category',
    targetId: row.id,
    targetLabel: row.name,
  });

  return row;
};

/** Deletes a category without subcategories (409 CATEGORY_HAS_CHILDREN); its products lose it. */
export const removeCategory = async (client: Db, id: string) => {
  const row = await findCategory(client, id);

  const [child] = await client
    .select({ id: productCategories.id })
    .from(productCategories)
    .where(eq(productCategories.parentId, id))
    .limit(1);

  if (child) {
    throw fail('CATEGORY_HAS_CHILDREN', 'Move or delete its subcategories first');
  }

  await client
    .update(products)
    .set({ categoryId: null, updatedAt: sql`now()` })
    .where(eq(products.categoryId, id));
  await client.delete(productCategories).where(eq(productCategories.id, id));
  await recordAudit(client, {
    action: 'product_category.deleted',
    targetType: 'product_category',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
};
