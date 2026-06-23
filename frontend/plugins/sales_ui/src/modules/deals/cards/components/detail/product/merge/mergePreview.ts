import { IProductData } from 'ui-modules';

/**
 * Pure, DB-free helpers that reproduce the backend merge on the client so the
 * preview shows exactly what `dealsMerge` will produce. They mirror
 * backend/plugins/sales_api/src/modules/sales/mergeSplit.ts — keep the two in
 * sync if the merge rules change.
 */

/** Identity for a product line — same product + uom + currency collapse. */
const lineKey = (pd: IProductData) =>
  [pd.productId || pd.product?._id || '', pd.uom || '', pd.currency || ''].join(
    '::',
  );

/**
 * Combine the product lines of the target deal and the source deal. Lines for
 * the same product (productId + uom + currency) are collapsed into one with
 * summed quantity / amount / discount / tax; the target line wins for the
 * remaining attributes such as unit price.
 */
export const mergeProductsData = (
  targetProductsData: IProductData[] = [],
  sourceProductsData: IProductData[] = [],
): IProductData[] => {
  const byKey = new Map<string, IProductData>();
  const order: string[] = [];

  const ingest = (lines: IProductData[] = []) => {
    for (const line of lines) {
      const productId = line?.productId || line?.product?._id;
      if (!line || !productId) continue;

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
  ingest(sourceProductsData);

  return order.map((key) => byKey.get(key) as IProductData);
};

/** Union of object arrays by `_id`, preserving first-seen order. */
export const unionById = <T extends { _id?: string }>(
  ...arrays: (T[] | undefined)[]
): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const arr of arrays) {
    for (const item of arr || []) {
      if (item?._id && !seen.has(item._id)) {
        seen.add(item._id);
        result.push(item);
      }
    }
  }

  return result;
};

/** Sum the `amount` of every product line. */
export const sumProductsAmount = (productsData: IProductData[] = []): number =>
  productsData.reduce((total, pd) => total + (pd.amount || 0), 0);
