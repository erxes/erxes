import { QueryHookOptions } from '@apollo/client';
import { useEffect } from 'react';
import { toast, useQueryState } from 'erxes-ui';
import { useProductDetail } from './useProductDetail';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';

export const useProductDetailWithQuery = (options?: QueryHookOptions) => {
  const [_id] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const queryProductId = _id ?? undefined;

  const { productDetail, productId, loading, error } = useProductDetail({
    ...options,
    variables: {
      ...options?.variables,
      _id: queryProductId,
    },
    skip: !queryProductId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error]);

  return { productDetail, productId, loading, error };
};
