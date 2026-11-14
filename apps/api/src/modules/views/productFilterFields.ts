import { type Db, PRODUCT_KINDS, productCategories, products } from '@erxes/core-db';
import { asc, type SQL, sql } from 'drizzle-orm';
import { field, type FieldSpec } from './fieldSpec';
import { textArray } from './filterValues';

/** Categories by their path (`Drinks › Tea`): rules name paths, a category takes in its subcategories. */
const categoryField = async (client: Db) => {
  const rows = await client
    .select({
      id: productCategories.id,
      name: productCategories.name,
      parentId: productCategories.parentId,
    })
    .from(productCategories);

  const byId = new Map(rows.map((row) => [row.id, row]));

  const pathOf = (id: string, seen = new Set<string>()): string => {
    const row = byId.get(id);

    if (!row || seen.has(id)) return '';

    seen.add(id);

    const parent = row.parentId ? pathOf(row.parentId, seen) : '';

    return parent ? `${parent} › ${row.name}` : row.name;
  };

  const paths = rows
    .map((row) => ({ id: row.id, path: pathOf(row.id) }))
    .toSorted((a, b) => a.path.localeCompare(b.path));

  const withChildren = (ids: Set<string>) => {
    let size = 0;

    while (size !== ids.size) {
      size = ids.size;

      for (const row of rows) if (row.parentId && ids.has(row.parentId)) ids.add(row.id);
    }

    return [...ids];
  };

  return field('categoryId', 'Category', 'select', sql`${products.categoryId}`, {
    options: paths.map((entry) => entry.path),
    lookup: (names) => {
      const wanted = new Set(names.map((name) => name.toLowerCase()));

      return textArray(
        withChildren(
          new Set(
            paths.filter((entry) => wanted.has(entry.path.toLowerCase())).map((entry) => entry.id),
          ),
        ),
      );
    },
  });
};

/** Values in use: the plugins using products, their currencies. */
const distinctOf = async (client: Db, column: SQL<string>) =>
  (await client.selectDistinct({ value: column }).from(products).orderBy(asc(column))).map(
    (row) => row.value,
  );

/** What the products list filters by (custom fields come with every list's). */
export const productFields = async (client: Db): Promise<FieldSpec[]> => [
  field('name', 'Name', 'text', sql`${products.name}`),
  field('code', 'Code', 'text', sql`${products.code}`),
  field('barcode', 'Barcode', 'text', sql`${products.barcode}`),
  field('kind', 'Type', 'select', sql`${products.kind}`, { options: [...PRODUCT_KINDS] }),
  await categoryField(client),
  field('price', 'Price', 'number', sql`${products.price}`),
  field('currency', 'Currency', 'select', sql`${products.currency}`, {
    options: await distinctOf(client, sql<string>`${products.currency}`),
  }),
  field('unit', 'Unit', 'text', sql`${products.unit}`),
  field('description', 'Description', 'text', sql`${products.description}`),
  field('plugins', 'Used by', 'select', sql`${products.plugins}`, {
    options: await distinctOf(client, sql<string>`unnest(${products.plugins})`),
    array: true,
  }),
  field('weightGrams', 'Weight (g)', 'number', sql`${products.weightGrams}`),
  field('lengthMm', 'Length (mm)', 'number', sql`${products.lengthMm}`),
  field('widthMm', 'Width (mm)', 'number', sql`${products.widthMm}`),
  field('heightMm', 'Height (mm)', 'number', sql`${products.heightMm}`),
  field('createdBy', 'Created by', 'member', sql`${products.createdBy}`),
  field('createdAt', 'Created', 'date', sql`${products.createdAt}`),
  field('updatedAt', 'Updated', 'date', sql`${products.updatedAt}`),
];
