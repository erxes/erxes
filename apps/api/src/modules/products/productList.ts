import type { CursorQuery, ProductKind, ProductStatus } from '@erxes/core-contract';
import { caller, type Db, productCategories, products } from '@erxes/core-db';
import { and, arrayContains, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { unique } from '~/lib/contacts';
import { containsPattern, keysetPage } from '~/lib/keyset';
import { compileRecordFilter } from '~/modules/views/recordFilter';
import { productColumns } from './productChecks';

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
const usedBy = (query: ProductQuery) => {
  const who = caller();
  const plugin = who.type === 'plugin' && !query.all ? who.plugin : query.plugin;

  return plugin ? arrayContains(products.plugins, [plugin]) : undefined;
};

export const listProducts = async (client: Db, query: CursorQuery & ProductQuery) => {
  const search = query.search ? containsPattern(query.search) : undefined;

  const filter = await compileRecordFilter(client, 'product', query.filter);

  return keysetPage(
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
      usedBy(query),
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
};

/** The given products in the order asked, archived ones too; unknown ids are left out. */
export const lookupProducts = async (client: Db, ids: string[]) => {
  const wanted = unique(ids);

  const rows = wanted.length
    ? await client.select(productColumns).from(products).where(inArray(products.id, wanted))
    : [];

  const byId = new Map(rows.map((row) => [row.id, row]));

  return { data: wanted.flatMap((id) => byId.get(id) ?? []) };
};
