import { IProduct, IProductData } from 'ui-modules';

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

    return Object.is(data[key as keyof IProductData], value);
  });
