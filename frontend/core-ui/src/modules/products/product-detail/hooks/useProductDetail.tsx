import { OperationVariables, useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { productCategoryDetail } from '../graphql/queries/productDetailQueries';
import { useSetAtom } from 'jotai';
import { renderingProductDetailAtom } from '../../states/productDetailStates';

export const useProductDetail = (operationVariables?: OperationVariables) => {
  const [searchParams] = useSearchParams();
  const _id = searchParams.get('product_id');
  const setRendering = useSetAtom(renderingProductDetailAtom);
  const { data, loading, error, refetch } = useQuery(productCategoryDetail, {
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
  return { productDetail: data?.productDetail ?? null, loading, error, refetch };
};
