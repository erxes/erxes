import type { DealProduct, DealProductData } from '@/deals/utils/dealJson';

import type { ProductDataWithUom, ProductUomInfo } from './productUom';

const NUMERIC_TOLERANCE = 0.0001;

const NUMERIC_PATCH_FIELDS = new Set<keyof DealProductData>([
  'quantity',
  'unitPrice',
  'globalUnitPrice',
  'unitPricePercent',
  'taxPercent',
  'tax',
  'vatPercent',
  'discountPercent',
  'discount',
  'amount',
  'maxQuantity',
]);

const isFieldApplied = (a: unknown, b: unknown, key: string) => {
  if (
    NUMERIC_PATCH_FIELDS.has(key as keyof DealProductData) &&
    typeof a === 'number' &&
    typeof b === 'number'
  ) {
    return Math.abs(a - b) < NUMERIC_TOLERANCE;
  }

  return Object.is(a, b);
};

const isProductPatchApplied = (
  data: DealProductData,
  patchProduct: DealProduct | undefined,
) => {
  if (!patchProduct?._id) {
    return true;
  }

  if (data.product?._id) {
    return (
      data.product._id === patchProduct._id &&
      data.product.name === patchProduct.name
    );
  }

  return data.productId === patchProduct._id;
};

// The product patch value is an object the server never echoes back by
// reference, so compare persisted fields instead of identity.
export const isPatchAppliedByServer = (
  data: ProductDataWithUom,
  patch: Partial<ProductDataWithUom>,
) =>
  Object.entries(patch).every(([key, value]) => {
    if (key === 'product') {
      return isProductPatchApplied(data, value as DealProduct | undefined);
    }

    if (key === 'uomInfo') {
      const expected = value as ProductUomInfo | undefined;
      if (!expected) return !data.uomInfo;
      const actual = data.uomInfo || {
        uom: data.uom,
        ratio: 1,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
      };
      return (
        actual.uom === expected.uom &&
        typeof actual.ratio === 'number' &&
        typeof expected.ratio === 'number' &&
        Math.abs(actual.ratio - expected.ratio) < NUMERIC_TOLERANCE &&
        typeof actual.unitPrice === 'number' &&
        typeof expected.unitPrice === 'number' &&
        Math.abs(actual.unitPrice - expected.unitPrice) < NUMERIC_TOLERANCE &&
        typeof actual.quantity === 'number' &&
        typeof expected.quantity === 'number' &&
        Math.abs(actual.quantity - expected.quantity) < NUMERIC_TOLERANCE
      );
    }

    return isFieldApplied(data[key as keyof DealProductData], value, key);
  });
