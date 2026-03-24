import { OperationVariables, useQuery } from '@apollo/client';
import { PRODUCT_DETAIL_QUERY } from '../graphql/queries/productDetailQueries';
import { useSetAtom } from 'jotai';
import { renderingProductDetailAtom } from '../../states/productDetailStates';
import { useQueryState } from 'erxes-ui';
import { PRODUCT_QUERY_KEY } from '../../constants/productQueryKey';

export const useProductDetail = (operationVariables?: OperationVariables) => {
  const [_id] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setRendering = useSetAtom(renderingProductDetailAtom);
  const { data, loading, error, refetch } = useQuery(PRODUCT_DETAIL_QUERY, {
    variables: {
      _id,
    },
    skip: !_id,
    ...operationVariables,
    onCompleted: (data) => {
      setRendering(false);
      operationVariables?.onCompleted?.(data);
    },
    onError: (error) => {
      setRendering(false);
      operationVariables?.onError?.(error);
    },
  });
  return {
    productDetail: data?.productDetail ?? null,
    loading,
    error,
    refetch,
  };
};
