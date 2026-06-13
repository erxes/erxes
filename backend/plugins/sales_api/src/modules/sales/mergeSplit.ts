import { IDealSplitInput, IProductData } from './@types';

/**
 * Pure (DB-free) helpers powering deal merge & split.
 *
 * Keeping the data-shaping logic free of any Mongoose / tRPC calls lets us
 * unit test the tricky parts (dedupe, allocation, validation) in isolation,
 * while the model layer (db/models/Deals.ts) handles persistence, relations,
 * activity logs and events.
 */

// ---------------------------------------------------------------------------
// Merge helpers
// ---------------------------------------------------------------------------

/**
 * Validate merge inputs before touching the database.
 * - exactly one source deal (merge is a two-deal operation)
 * - target & source cannot overlap
 */
export const validateMergeInput = (
  sourceDealIds: string[],
  targetDealId: string,
): string[] => {
  if (!targetDealId) {
    throw new Error('Target deal is required');
  }

  const sources = (sourceDealIds || []).filter(Boolean);

  if (!sources.length) {
    throw new Error('A source deal is required');
  }

  if (sources.includes(targetDealId)) {
    throw new Error('Source and target deals cannot overlap');
  }

  const unique = Array.from(new Set(sources));

  if (unique.length > 1) {
    throw new Error('Only two deals can be merged at a time');
  }

  return unique;
};

/**
 * Combine the product lines of the target deal and the source deal(s).
 *
 * Lines for the same product (productId + uom + currency) are collapsed into a
 * single line with summed quantity / amount / discount / tax, so a merge never
 * leaves duplicate product rows. The target deal's line wins for the remaining
 * (non-additive) attributes such as unit price.
 */
export const mergeProductsData = (
  targetProductsData: IProductData[] = [],
  sourcesProductsData: IProductData[][] = [],
): IProductData[] => {
  const lineKey = (pd: IProductData) =>
    [pd.productId, pd.uom || '', pd.currency || ''].join('::');

  const byKey = new Map<string, IProductData>();
  const order: string[] = [];

  const ingest = (lines: IProductData[] = []) => {
    for (const line of lines) {
      if (!line || !line.productId) {
        continue;
      }

      const key = lineKey(line);
      const existing = byKey.get(key);

      if (!existing) {
        byKey.set(key, { ...line });
        order.push(key);
        continue;
      }

      existing.quantity = (existing.quantity || 0) + (line.quantity || 0);
      existing.amount = (existing.amount || 0) + (line.amount || 0);
      existing.discount = (existing.discount || 0) + (line.discount || 0);
      existing.tax = (existing.tax || 0) + (line.tax || 0);
    }
  };

  ingest(targetProductsData);
  for (const lines of sourcesProductsData) {
    ingest(lines);
  }

  return order.map((key) => byKey.get(key) as IProductData);
};

/** Union of several id arrays, preserving first-seen order and dropping falsy. */
export const unionIds = (
  ...arrays: (ReadonlyArray<string | null | undefined> | undefined)[]
): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const arr of arrays) {
    for (const id of arr || []) {
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push(id);
      }
    }
  }

  return result;
};

// ---------------------------------------------------------------------------
// Split helpers
// ---------------------------------------------------------------------------

/** Validate split inputs before touching the database. */
export const validateSplitInput = (
  splits: IDealSplitInput[],
  sourceProductsData: IProductData[] = [],
): void => {
  if (!splits?.length) {
    throw new Error('At least one split is required');
  }

  const validIds = new Set(
    (sourceProductsData || []).map((pd) => pd._id).filter(Boolean) as string[],
  );

  for (const split of splits) {
    for (const productId of split.productIds || []) {
      if (!validIds.has(productId)) {
        throw new Error(
          `Product line "${productId}" does not belong to the source deal`,
        );
      }
    }

    if (split.amount != null && split.amount < 0) {
      throw new Error('Split amount cannot be negative');
    }
  }
};

/**
 * Resolve the productsData lines a given split should receive.
 * When productIds are provided we pick those exact lines; otherwise the child
 * starts with no products (amount-only allocation).
 */
export const selectSplitProductsData = (
  split: IDealSplitInput,
  sourceProductsData: IProductData[] = [],
): IProductData[] => {
  if (!split.productIds?.length) {
    return [];
  }

  const wanted = new Set(split.productIds);
  return (sourceProductsData || [])
    .filter((pd) => pd._id && wanted.has(pd._id))
    .map((pd) => ({ ...pd }));
};

/** Collect every product-line id allocated across all splits. */
export const collectAllocatedLineIds = (
  splits: IDealSplitInput[] = [],
): Set<string> => {
  const ids = new Set<string>();
  for (const split of splits) {
    for (const id of split.productIds || []) {
      ids.add(id);
    }
  }
  return ids;
};

/**
 * Product lines that should REMAIN on the original deal after splitting —
 * i.e. everything not moved into a child deal.
 */
export const removeSplitProductsData = (
  sourceProductsData: IProductData[] = [],
  splits: IDealSplitInput[] = [],
): IProductData[] => {
  const allocated = collectAllocatedLineIds(splits);
  return (sourceProductsData || []).filter(
    (pd) => !pd._id || !allocated.has(pd._id),
  );
};
