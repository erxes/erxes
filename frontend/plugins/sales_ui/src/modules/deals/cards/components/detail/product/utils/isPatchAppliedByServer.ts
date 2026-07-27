import { IProduct, IProductData } from 'ui-modules';

const NUMERIC_TOLERANCE = 0.0001;

const NUMERIC_PATCH_FIELDS = new Set<keyof IProductData>([
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
    NUMERIC_PATCH_FIELDS.has(key as keyof IProductData) &&
    typeof a === 'number' &&
    typeof b === 'number'
  ) {
    return Math.abs(a - b) < NUMERIC_TOLERANCE;
  }

  return Object.is(a, b);
};

const isProductPatchApplied = (
  data: IProductData,
  patchProduct: IProduct | undefined,
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
  data: IProductData,
  patch: Partial<IProductData>,
) =>
  Object.entries(patch).every(([key, value]) => {
    if (key === 'product') {
      return isProductPatchApplied(data, value as IProduct | undefined);
    }

    return isFieldApplied(data[key as keyof IProductData], value, key);
  });
