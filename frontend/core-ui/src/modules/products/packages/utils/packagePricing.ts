import { IPackageProduct } from '../types/Package';

const round = (value: number) => +value.toFixed(2);

// The package price for a discount on the products' total; no discount
// sells it at the total. Nothing to price without products.
export const priceFromPercent = (
  total: number | null | undefined,
  percent: number | null | undefined,
) => {
  if (!total) return null;
  return percent ? round(total * (1 - percent / 100)) : total;
};

// The discount a price gives off the products' total, when it is one. A
// free package is a full discount, so it stays free as the total changes.
export const percentFromPrice = (
  total: number | null | undefined,
  price: number | null | undefined,
) =>
  total && price != null && price >= 0 && price < total
    ? round((1 - price / total) * 100)
    : null;

// Couples a discount or price change with the other off the latest total.
export const withCoupledPricing = <
  T extends { price?: number | null; percent?: number | null },
>(
  patch: T,
  total: number | null | undefined,
): T => {
  if (!total) return patch;
  if ('percent' in patch && !('price' in patch)) {
    return { ...patch, price: priceFromPercent(total, patch.percent) };
  }
  if ('price' in patch && !('percent' in patch)) {
    return { ...patch, percent: percentFromPrice(total, patch.price) };
  }
  return patch;
};

// Products as `ProductPackageInput`: the query's `__typename` is left out.
export const toPackageProductsInput = (
  products?: IPackageProduct[] | null,
): IPackageProduct[] =>
  (products || []).map(({ productId, quantity }) => ({ productId, quantity }));
