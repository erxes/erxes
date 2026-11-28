import { LIST_MAX, NO_PLACE } from '@erxes/core-contract';
import { type Db, newId, orgUnits, productInventories, products } from '@erxes/core-db';
import { and, asc, eq, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { fail } from '~/http/errors';
import { unique } from '~/lib/contacts';

/** A branch and a department; one left out is none, as 3.x's `_` key. */
export interface Place {
  branchId?: string;
  departmentId?: string;
}

const inventory = productInventories;

/** The rows of that one place. */
const atPlace = ({ branchId, departmentId }: Place) =>
  and(
    branchId ? eq(inventory.branchId, branchId) : isNull(inventory.branchId),
    departmentId ? eq(inventory.departmentId, departmentId) : isNull(inventory.departmentId),
  );

/** A place is named when either id is: 3.x read `product.inventories[branch][department]` then. */
const namesPlace = ({ branchId, departmentId }: Place) => Boolean(branchId || departmentId);

/** The column is one of the ids; `NO_PLACE` among them is a null column. */
const inPlaces = (column: PgColumn, ids: string[] | undefined) => {
  if (!ids?.length) return undefined;

  const named = ids.filter((id) => id !== NO_PLACE);

  return or(
    named.length ? inArray(column, named) : undefined,
    ids.includes(NO_PLACE) ? isNull(column) : undefined,
  );
};

/** 0 for a null amount, as 3.x read an unset one. */
const total = (column: PgColumn) =>
  sql<number>`coalesce(sum(coalesce(${column}, 0)), 0)`.mapWith(Number);

/** Every given product exists (archived ones too); stock is never written for an unknown id. */
const checkProducts = async (client: Db, ids: string[]) => {
  const found = await client
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, ids));

  if (found.length !== ids.length) throw fail('INVALID_PRODUCT', 'Unknown product');
};

const placeColumns = (place: Place) => ({
  branchId: place.branchId ?? null,
  departmentId: place.departmentId ?? null,
});

/** 3.x set an amount that is not 0 and unset the rest, which reads as 0. */
const amount = (value?: number) => (value === undefined || value === 0 ? null : value);

/** The stored amount, 0 when unset, plus the one being inserted. */
const added = (column: PgColumn, name: string) =>
  sql`coalesce(${column}, 0) + excluded.${sql.raw(name)}`;

const PLACE_TARGET = [
  inventory.orgId,
  inventory.productId,
  inventory.branchId,
  inventory.departmentId,
];

/** The products' rows: every place, or the one named; by product, the no-branch place first. */
export const listInventories = async (client: Db, query: Place & { productIds: string[] }) => {
  const ids = unique(query.productIds);

  const data = ids.length
    ? await client
        .select()
        .from(inventory)
        .where(
          and(inArray(inventory.productId, ids), namesPlace(query) ? atPlace(query) : undefined),
        )
        .orderBy(
          asc(inventory.productId),
          sql`${inventory.branchId} asc nulls first`,
          sql`${inventory.departmentId} asc nulls first`,
        )
        .limit(LIST_MAX)
    : [];

  return { data };
};

/**
 * 3.x's `setInventories`: each amount set, or cleared when left out or 0 (3.x unset it); the
 * row stays, so the product still counts as stock-tracked. A product twice takes its last line.
 */
export const setInventories = async (
  client: Db,
  input: Place & {
    items: {
      productId: string;
      remainder?: number;
      cost?: number;
      soonIn?: number;
      soonOut?: number;
    }[];
  },
) => {
  const items = [...new Map(input.items.map((item) => [item.productId, item])).values()];

  await checkProducts(
    client,
    items.map((item) => item.productId),
  );

  const data = await client
    .insert(inventory)
    .values(
      items.map((item) => ({
        id: newId(),
        productId: item.productId,
        ...placeColumns(input),
        remainder: amount(item.remainder),
        cost: amount(item.cost),
        soonIn: amount(item.soonIn),
        soonOut: amount(item.soonOut),
      })),
    )
    .onConflictDoUpdate({
      target: PLACE_TARGET,
      set: {
        remainder: sql`excluded.remainder`,
        cost: sql`excluded.cost`,
        soonIn: sql`excluded.soon_in`,
        soonOut: sql`excluded.soon_out`,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  return { data };
};

/**
 * 3.x's `increaseInventories`: adds each diff (0 when left out) to the amount there, an unset one
 * counting as 0, in one statement, so concurrent writers each add theirs. A product twice adds
 * both lines.
 */
export const increaseInventories = async (
  client: Db,
  input: Place & {
    items: {
      productId: string;
      diffCount?: number;
      diffCost?: number;
      diffSoonIn?: number;
      diffSoonOut?: number;
    }[];
  },
) => {
  const sums = new Map<
    string,
    { remainder: number; cost: number; soonIn: number; soonOut: number }
  >();

  for (const item of input.items) {
    const sum = sums.get(item.productId) ?? { remainder: 0, cost: 0, soonIn: 0, soonOut: 0 };

    sums.set(item.productId, {
      remainder: sum.remainder + (item.diffCount ?? 0),
      cost: sum.cost + (item.diffCost ?? 0),
      soonIn: sum.soonIn + (item.diffSoonIn ?? 0),
      soonOut: sum.soonOut + (item.diffSoonOut ?? 0),
    });
  }

  await checkProducts(client, [...sums.keys()]);

  const data = await client
    .insert(inventory)
    .values(
      [...sums].map(([productId, sum]) => ({
        id: newId(),
        productId,
        ...placeColumns(input),
        ...sum,
      })),
    )
    .onConflictDoUpdate({
      target: PLACE_TARGET,
      set: {
        remainder: added(inventory.remainder, 'remainder'),
        cost: added(inventory.cost, 'cost'),
        soonIn: added(inventory.soonIn, 'soon_in'),
        soonOut: added(inventory.soonOut, 'soon_out'),
        updatedAt: sql`now()`,
      },
    })
    .returning();

  return { data };
};

/**
 * 3.x's `product.remainder`: the named place's amounts (null where it has none), else the sums
 * over the places in `branchIds` and `departmentIds` (every place when left out). Unknown
 * products are left out; the rest keep the order asked.
 */
export const productRemainders = async (
  client: Db,
  query: Place & { ids: string[]; branchIds?: string[]; departmentIds?: string[] },
) => {
  const ids = unique(query.ids);

  if (!ids.length) return { data: [] };

  const joined = namesPlace(query)
    ? and(eq(inventory.productId, products.id), atPlace(query))
    : and(
        eq(inventory.productId, products.id),
        inPlaces(inventory.branchId, query.branchIds),
        inPlaces(inventory.departmentId, query.departmentIds),
      );

  const rows = namesPlace(query)
    ? await client
        .select({
          productId: products.id,
          remainder: inventory.remainder,
          cost: inventory.cost,
          soonIn: inventory.soonIn,
          soonOut: inventory.soonOut,
        })
        .from(products)
        .leftJoin(inventory, joined)
        .where(inArray(products.id, ids))
    : await client
        .select({
          productId: products.id,
          remainder: total(inventory.remainder),
          cost: total(inventory.cost),
          soonIn: total(inventory.soonIn),
          soonOut: total(inventory.soonOut),
        })
        .from(products)
        .leftJoin(inventory, joined)
        .where(inArray(products.id, ids))
        .groupBy(products.id);

  const byId = new Map(rows.map((row) => [row.productId, row]));

  return { data: ids.flatMap((id) => byId.get(id) ?? []) };
};

/**
 * 3.x's `toProductStockView`: the total and each branch's total over its departments, with the
 * branch's name ('' once it is gone); stock with no branch counts only in the total. Cost never
 * shows. Unknown products are left out; the rest keep the order asked.
 */
export const productStock = async (client: Db, ids: string[]) => {
  const wanted = unique(ids);

  if (!wanted.length) return { data: [] };

  const found = await client
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, wanted));

  const byBranch = await client
    .select({
      productId: inventory.productId,
      branchId: inventory.branchId,
      remainder: total(inventory.remainder),
    })
    .from(inventory)
    .where(inArray(inventory.productId, wanted))
    .groupBy(inventory.productId, inventory.branchId);

  const branchIds = unique(byBranch.map((row) => row.branchId));

  const names = new Map(
    (branchIds.length
      ? await client
          .select({ id: orgUnits.id, name: orgUnits.name })
          .from(orgUnits)
          .where(inArray(orgUnits.id, branchIds))
      : []
    ).map((unit) => [unit.id, unit.name]),
  );

  const known = new Set(found.map((row) => row.id));

  const data = wanted
    .filter((id) => known.has(id))
    .map((productId) => {
      const rows = byBranch.filter((row) => row.productId === productId);

      return {
        productId,
        stockTracked: rows.length > 0,
        remainder: rows.reduce((sum, row) => sum + row.remainder, 0),
        branches: rows
          .flatMap(({ branchId, remainder }) =>
            branchId ? [{ branchId, name: names.get(branchId) ?? '', remainder }] : [],
          )
          .toSorted((a, b) => a.name.localeCompare(b.name) || a.branchId.localeCompare(b.branchId)),
      };
    });

  return { data };
};

/**
 * `products.list`'s stock filter: in the named place, a set remainder within the bounds (3.x's
 * `$exists`); else the total over every place, 0 for a product without stock.
 */
export const remainderFilter = (
  query: Place & { minRemainder?: number; maxRemainder?: number },
): SQL | undefined => {
  const { minRemainder: min, maxRemainder: max } = query;

  if (min === undefined && max === undefined) return undefined;

  if (namesPlace(query)) {
    return sql`exists (select 1 from ${inventory} where ${and(
      eq(inventory.productId, products.id),
      atPlace(query),
      sql`${inventory.remainder} is not null`,
      min === undefined ? undefined : sql`${inventory.remainder} >= ${min}`,
      max === undefined ? undefined : sql`${inventory.remainder} <= ${max}`,
    )})`;
  }

  const sum = sql`(select coalesce(sum(coalesce(${inventory.remainder}, 0)), 0) from ${inventory} where ${inventory.productId} = ${products.id})`;

  return and(
    min === undefined ? undefined : sql`${sum} >= ${min}`,
    max === undefined ? undefined : sql`${sum} <= ${max}`,
  );
};
