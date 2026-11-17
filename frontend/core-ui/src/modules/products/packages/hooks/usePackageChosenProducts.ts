import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { IProduct } from 'ui-modules';
import { GET_PACKAGE_CHOSEN_PRODUCTS } from '../graphql/packageQueries';
import { IPackageProduct } from '../types/Package';

export type TPackageChosenProduct = Pick<
  IProduct,
  '_id' | 'name' | 'code' | 'unitPrice'
>;

/**
 * The products a package holds, however many there are, so each line and
 * the total are priced from every one of them. While a change is fetched,
 * or `retry` runs, the previous list stays shown.
 */
export const usePackageChosenProducts = (ids: string[]) => {
  const hasIds = ids.length > 0;
  const { data, previousData, loading, error, refetch } = useQuery<{
    products: TPackageChosenProduct[] | null;
  }>(GET_PACKAGE_CHOSEN_PRODUCTS, {
    skip: !hasIds,
    variables: { ids },
    // So a retry shows as loading.
    notifyOnNetworkStatusChange: true,
  });

  return {
    products: hasIds ? (data ?? previousData)?.products ?? [] : [],
    loading: hasIds && loading,
    error: hasIds ? error : undefined,
    // A retry that fails again is reported through `error`.
    retry: () => {
      refetch().catch(() => undefined);
    },
  };
};

/**
 * What the chosen products come to at their unit prices, known without the
 * Products tab being opened. While a change is priced (`loading`) or the
 * products could not be loaded (`error`), `total` is not theirs.
 */
export const usePackageProductsTotal = (items: IPackageProduct[]) => {
  const ids = useMemo(() => items.map((item) => item.productId), [items]);
  const { products, loading, error } = usePackageChosenProducts(ids);
  const prices = new Map(
    products.map((product) => [product._id, Number(product.unitPrice) || 0]),
  );

  return {
    total: items.reduce(
      (sum, item) => sum + (prices.get(item.productId) ?? 0) * item.quantity,
      0,
    ),
    loading,
    error,
  };
};
