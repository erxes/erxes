import type { CursorQuery, Product, ProductKind, ProductStatus } from '@erxes/core-contract';
import { type Db, productCategories, products } from '@erxes/core-db';
import { and, arrayContains, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { unique } from '~/lib/contacts';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { compileRecordFilter } from '~/modules/views/recordFilter';
import { findProduct, productColumns, type ProductRow } from './productChecks';

export const toProductDto = (row: ProductRow): Product => ({
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
  customFields: row.customFields,
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
  filter?: string;
}

/** Products in a category or any of its subcategories. */
const inCategory = (categoryId: string) => sql`${products.categoryId} in (
  with recursive tree as (
    select id from ${productCategories} where id = ${categoryId}
    union all
    select c.id from ${productCategories} c join tree on c.parent_id = tree.id
  )
  select id from tree
)`;

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

  const filter = await compileRecordFilter(
    client,
    { userId: caller.actorType === 'user' ? caller.actorId : null },
    'product',
    query.filter,
  );

  const page = await keysetPage(
    client,
    {
      table: products,
      id: products.id,
      createdAt: products.createdAt,
    },
    and(
      eq(products.status, query.status),
      filter,
      query.kind ? eq(products.kind, query.kind) : undefined,
      query.categoryId ? inCategory(query.categoryId) : undefined,
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
        .select(productColumns)
        .from(products)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toProductDto) };
};

export const getProduct = async (client: Db, id: string) =>
  toProductDto(await findProduct(client, id));

/** The given products in the order asked, archived ones too; unknown ids are left out. */
export const lookupProducts = async (client: Db, ids: string[]) => {
  const wanted = unique(ids);

  const rows = wanted.length
    ? await client.select(productColumns).from(products).where(inArray(products.id, wanted))
    : [];

  const byId = new Map(rows.map((row) => [row.id, toProductDto(row)]));

  return { data: wanted.flatMap((id) => byId.get(id) ?? []) };
};
