import { IDeal } from '@/deals/types/deals';
import { IProductData } from 'ui-modules';

/**
 * Split the source deal's product lines into the ones that will move into the
 * new deal (selected) and the ones that stay behind. Mirrors the backend's
 * selectSplitProductsData / removeSplitProductsData so the preview matches what
 * dealsSplit produces.
 */
export const partitionSplitProducts = (
  productsData: IProductData[] = [],
  selectedLineIds: string[] = [],
): { moving: IProductData[]; staying: IProductData[] } => {
  const selected = new Set(selectedLineIds);
  const moving: IProductData[] = [];
  const staying: IProductData[] = [];

  for (const pd of productsData) {
    if (pd._id && selected.has(pd._id)) {
      moving.push(pd);
    } else {
      staying.push(pd);
    }
  }

  return { moving, staying };
};

/** productId → product name lookup from a deal's resolved products array. */
export const buildProductNameMap = (deal?: IDeal): Map<string, string> => {
  const map = new Map<string, string>();
  for (const product of deal?.products || []) {
    if (product?._id) map.set(product._id, product.name);
  }
  return map;
};
