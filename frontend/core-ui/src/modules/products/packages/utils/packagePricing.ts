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

// The discount a price gives off the products' total, when it is one.
export const percentFromPrice = (
  total: number | null | undefined,
  price: number | null | undefined,
) =>
  total && price && price > 0 && price < total
    ? round((1 - price / total) * 100)
    : null;

// Products as `ProductPackageInput`: the query's `__typename` is left out.
export const toPackageProductsInput = (
  products?: IPackageProduct[] | null,
): IPackageProduct[] =>
  (products || []).map(({ productId, quantity }) => ({ productId, quantity }));
