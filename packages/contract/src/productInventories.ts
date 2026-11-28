import { productInventories } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { COMMON_ERRORS, ERRORS } from './errors';
import { Id, IdList, isoDate, LIST_MAX } from './common';

const amount = () => z.number();

/**
 * A product's stock in one place: a branch and a department, null for none (3.x's
 * `product.inventories[branchId][departmentId]`). A null amount counts as 0.
 */
export const ProductInventory = createSelectSchema(productInventories, {
  productId: () => Id,
  branchId: () => Id.nullable(),
  departmentId: () => Id.nullable(),
  remainder: amount,
  cost: amount,
  soonIn: amount,
  soonOut: amount,
  updatedAt: isoDate,
}).pick({
  productId: true,
  branchId: true,
  departmentId: true,
  remainder: true,
  cost: true,
  soonIn: true,
  soonOut: true,
  updatedAt: true,
});

export type ProductInventory = z.infer<typeof ProductInventory>;

/**
 * A product's stock as 3.x's `product.remainder` answered it: one place's amounts (null when
 * that place has none), or the sums over the places asked for.
 */
export const ProductRemainder = z.object({
  productId: Id,
  remainder: z.number().nullable(),
  cost: z.number().nullable(),
  soonIn: z.number().nullable(),
  soonOut: z.number().nullable(),
});

export type ProductRemainder = z.infer<typeof ProductRemainder>;

/**
 * A product's stock as a customer may hear it (3.x's `toProductStockView`): the total and the
 * total per branch, never the cost. `stockTracked` is false for a product without stock rows,
 * which is not the same as sold out.
 */
export const ProductStock = z.object({
  productId: Id,
  stockTracked: z.boolean(),
  remainder: z.number(),
  /** Each branch's total over its departments, with its name; stock with no branch counts only in `remainder`. */
  branches: z.array(z.object({ branchId: Id, name: z.string(), remainder: z.number() })),
});

export type ProductStock = z.infer<typeof ProductStock>;

/** The place stock is written to or read from: a branch and a department, either left out for none. */
const Place = z.object({ branchId: Id.optional(), departmentId: Id.optional() });

/** 3.x's batches were 1000 lines. */
const BATCH_MAX = 1000;

/** Ids to sum over; `NO_PLACE` (`_`) names no branch (or no department), as 3.x's keys did. */
const PlaceIds = IdList.optional();

const { INVALID_PRODUCT } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, INVALID_PRODUCT });

/**
 * Products' stock by branch and department. The plugin that keeps the stock writes it with
 * `inventories:write`; members and plugins with `products:read` read it.
 */
export const productInventoriesContract = {
  list: base
    .route({
      method: 'GET',
      path: '/product-inventories',
      summary: "List products' stock rows",
      description:
        "The products' stock rows (3.x's `product.inventories`): every place, or the one place `branchId` and `departmentId` name (either left out for none); the first 1000 by product, the no-branch place first",
    })
    .input(Place.extend({ productIds: IdList }))
    .output(z.object({ data: z.array(ProductInventory).max(LIST_MAX) })),
  remainders: base
    .route({
      method: 'GET',
      path: '/product-inventories/remainders',
      summary: "Get products' remainders",
      description:
        "Each product's stock as 3.x's `product.remainder`: the place `branchId` and `departmentId` name, else the sums over `branchIds` and `departmentIds` (all when left out; `_` for none)",
    })
    .input(Place.extend({ ids: IdList, branchIds: PlaceIds, departmentIds: PlaceIds }))
    .output(z.object({ data: z.array(ProductRemainder).max(100) })),
  stock: base
    .route({
      method: 'GET',
      path: '/product-inventories/stock',
      summary: "Get products' stock by branch",
      description: "Each product's stock in total and by branch, without cost: `?ids=a,b`",
    })
    .input(z.object({ ids: IdList }))
    .output(z.object({ data: z.array(ProductStock).max(100) })),
  set: base
    .route({
      method: 'POST',
      path: '/product-inventories/set',
      summary: "Set products' stock in one place",
      description:
        "Set products' stock in one place (3.x's `setInventories`); an amount left out or 0 is cleared. 400 INVALID_PRODUCT",
    })
    .input(
      Place.extend({
        items: z
          .array(
            z.object({
              productId: Id,
              remainder: z.number().optional(),
              cost: z.number().optional(),
              soonIn: z.number().optional(),
              soonOut: z.number().optional(),
            }),
          )
          .min(1)
          .max(BATCH_MAX),
      }),
    )
    .output(z.object({ data: z.array(ProductInventory).max(BATCH_MAX) })),
  increase: base
    .route({
      method: 'POST',
      path: '/product-inventories/increase',
      summary: "Add to products' stock in one place",
      description:
        "Add to products' stock in one place (3.x's `increaseInventories`); a diff left out adds 0. 400 INVALID_PRODUCT",
    })
    .input(
      Place.extend({
        items: z
          .array(
            z.object({
              productId: Id,
              diffCount: z.number().optional(),
              diffCost: z.number().optional(),
              diffSoonIn: z.number().optional(),
              diffSoonOut: z.number().optional(),
            }),
          )
          .min(1)
          .max(BATCH_MAX),
      }),
    )
    .output(z.object({ data: z.array(ProductInventory).max(BATCH_MAX) })),
};
