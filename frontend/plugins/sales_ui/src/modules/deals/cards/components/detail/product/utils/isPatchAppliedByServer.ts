import type { DealProduct, DealProductData } from '@/deals/utils/dealJson';

import type { ProductDataWithUom, ProductUomInfo } from './productUom';

const NUMERIC_TOLERANCE = 0.0001;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValueApplied = (actual: unknown, expected: unknown): boolean => {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < NUMERIC_TOLERANCE;
  }

  if (Array.isArray(expected)) {
    const actualList: unknown = actual ?? [];

    return (
      Array.isArray(actualList) &&
      actualList.length === expected.length &&
      expected.every((item, index) => isValueApplied(actualList[index], item))
    );
  }

  if (isRecord(expected)) {
    return (
      isRecord(actual) &&
      Object.entries(expected).every(([key, value]) =>
        isValueApplied(actual[key], value),
      )
    );
  }

  if (expected === null || expected === undefined) {
    return actual === null || actual === undefined;
  }

  return Object.is(actual, expected);
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

    return isValueApplied(data[key as keyof DealProductData], value);
  });
