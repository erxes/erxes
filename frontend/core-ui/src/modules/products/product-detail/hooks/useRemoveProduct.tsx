import { MutationHookOptions, useMutation } from '@apollo/client';
import { productsRemoveMutation } from '../graphql/mutations/ProductRemoveMutations';
import { productsQueries } from '@/products/graphql';
import { useRecordTableCursor } from 'erxes-ui';
import { IProduct } from 'ui-modules';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';
import {
  PRODUCTS_PER_PAGE,
  useProductsVariables,
} from '@/products/hooks/useProducts';

type ProductsMainCache = {
  productsMain?: {
    list?: IProduct[];
    totalCount?: number;
    [key: string]: unknown;
  };
} | null;

/**
 * Removes the given products from the cached `productsMain` list in place
 * (keeping the loaded cursor window intact) and decrements totalCount.
 */
const removeProductsFromCache = (
  data: ProductsMainCache,
  productIds: string[],
) => {
  if (!data?.productsMain) return undefined;

  const { productsMain } = data;
  const list = productsMain.list || [];
  const updatedList = list.filter(
    (product) => !productIds.includes(product._id),
  );
  const removedCount = list.length - updatedList.length;

  return {
    productsMain: {
      ...productsMain,
      list: updatedList,
      totalCount: Math.max((productsMain.totalCount ?? 0) - removedCount, 0),
    },
  };
};

export const useRemoveProducts = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PRODUCTS_CURSOR_SESSION_KEY,
  });
  const productsQueryVariables = useProductsVariables({
    cursor,
    limit: PRODUCTS_PER_PAGE,
  });
  const [_removeProducts, { loading }] = useMutation(
    productsRemoveMutation.productRemove,
  );

  const removeProducts = async (
    productIds: string[],
    options?: MutationHookOptions,
  ) => {
    await _removeProducts({
      ...options,
      variables: { productIds, ...options?.variables },
      update: (cache) => {
        cache.updateQuery(
          {
            query: productsQueries.productsMain,
            variables: productsQueryVariables,
          },
          (data) => removeProductsFromCache(data, productIds),
        );
      },
    });
  };

  return { removeProducts, loading };
};
