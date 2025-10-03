import { OperationVariables, useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { renderingCategoryDetailAtom } from '../../states/ProductCategory';
import { productsQueries } from '@/products/graphql';
import { useQueryState } from 'erxes-ui';

export const useProductCategoryDetail = (operationVariables?: OperationVariables) => {
  const [_id] = useQueryState('category_id');
  const setRendering = useSetAtom(renderingCategoryDetailAtom);

  const { data, loading, error } = useQuery(productsQueries.productCategoryDetail, {
    variables: { _id },
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
    categoryDetail: data?.productCategoryDetail ?? null,
    loading,
    error,
  };
};
