import { QueryHookOptions, useQuery } from '@apollo/client';
import { PRODUCT_DETAIL_QUERY } from '../graphql/queries/productDetailQueries';
import { useSetAtom } from 'jotai';
import { renderingProductDetailAtom } from '../../states/productDetailStates';
import { useQueryState } from 'erxes-ui';
import { PRODUCT_QUERY_KEY } from '../../constants/productQueryKey';
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
  const [_id] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setRendering = useSetAtom(renderingProductDetailAtom);

  const {
    _id: optionId,
    variables: optionVariables,
    skip,
    onCompleted,
    onError,
    fetchPolicy,
    ...queryOptions
  } = options || {};

  const productId = optionVariables?._id || optionId || _id || '';

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
    onCompleted: (data) => {
      setRendering(false);
      onCompleted?.(data);
    },
    onError: (error) => {
      setRendering(false);
      onError?.(error);
    },
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
