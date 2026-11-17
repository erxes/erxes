import { QueryHookOptions, useQuery } from '@apollo/client';
import { PRODUCT_DETAIL_QUERY } from '../graphql/queries/productDetailQueries';
import { ProductDetail } from '../types/detailTypes';

type ProductDetailQueryData = {
  productDetail: ProductDetail | null;
};

type ProductDetailQueryVariables = {
  _id?: string;
};

type ProductDetailQueryOptions = QueryHookOptions<
  ProductDetailQueryData,
  ProductDetailQueryVariables
> & {
  _id?: string;
};

export const useProductDetail = (options?: ProductDetailQueryOptions) => {
  const {
    _id: optionId,
    variables: optionVariables,
    skip,
    fetchPolicy,
    ...queryOptions
  } = options || {};

  const productId = optionVariables?._id || optionId || '';

  const { data, loading, error, refetch } = useQuery<
    ProductDetailQueryData,
    ProductDetailQueryVariables
  >(PRODUCT_DETAIL_QUERY, {
    ...queryOptions,
    variables: {
      ...optionVariables,
      _id: productId,
    },
    skip: !productId || skip,
    fetchPolicy: fetchPolicy || 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const productDetail =
    data?.productDetail?._id === productId ? data.productDetail : null;

  return {
    productDetail,
    productId,
    loading,
    error,
    refetch,
  };
};
