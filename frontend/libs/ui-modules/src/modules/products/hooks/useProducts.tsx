import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  GET_ASSIGNED_PRODUCTS,
  GET_PRODUCTS,
} from '../graphql/queries/getProducts';
import { IProduct } from '../types/Product';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';

const PRODUCTS_LIMIT = 30;
export const useProducts = (
  options?: QueryHookOptions<ICursorListResponse<IProduct>>,
) => {
  const { data, loading, fetchMore, error } = useQuery<
    ICursorListResponse<IProduct>
  >(GET_PRODUCTS, {
    ...options,
    variables: {
      limit: PRODUCTS_LIMIT,
      ...options?.variables,
    },
  });
  const { list = [], totalCount = 0, pageInfo } = data?.productsMain || {};

  const handleFetchMore = () => {
    if (!pageInfo || totalCount <= list.length) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          productsMain: {
            list: [
              ...(prev.productsMain?.list || []),
              ...fetchMoreResult.productsMain.list,
            ],
            totalCount: fetchMoreResult.productsMain.totalCount,
            pageInfo: fetchMoreResult.productsMain.pageInfo,
          },
        });
      },
    });
  };
  return {
    products: list,
    loading,
    handleFetchMore,
    totalCount,
    error,
  };
};


export const useProductsInline = (options?: QueryHookOptions<ICursorListResponse<IProduct>>) => {
  const { data, loading, error } = useQuery<ICursorListResponse<IProduct>>(
    GET_ASSIGNED_PRODUCTS,
    options,
  );
  return { products: data?.productsMain?.list || [], loading, error };
};
