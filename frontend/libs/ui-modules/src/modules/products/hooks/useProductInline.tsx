import { OperationVariables, useQuery } from '@apollo/client';
import { GET_PRODUCT_INLINE } from '../graphql/queries/getProducts';

export const useProductInline = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery(GET_PRODUCT_INLINE, options);
  return {
    product: data?.productDetail,
    loading,
    error,
  };
};
