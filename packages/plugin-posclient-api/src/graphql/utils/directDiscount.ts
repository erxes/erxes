import { IOrderInput } from '../types';

export const checkDirectDiscount = (doc: IOrderInput) => {
  const { directDiscount, items } = doc;
  if (!directDiscount) return doc;

  for (const item of items || []) {
    const discountValue = parseFloat(
      ((item.unitPrice * directDiscount) / 100).toFixed(2)
    );
    item.unitPrice -= discountValue;
    item.discountAmount = discountValue * item.count;
  }

  return doc;
};
