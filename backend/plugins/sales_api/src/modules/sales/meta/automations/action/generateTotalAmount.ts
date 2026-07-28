import type { IProductData } from '../../../@types';

export const generateTotalAmount = (productsData?: IProductData[]) => {
  let totalAmount = 0;

  (productsData || []).forEach((product) => {
    if (product.tickUsed) {
      return;
    }

    totalAmount += product?.amount || 0;
  });

  return totalAmount;
};
