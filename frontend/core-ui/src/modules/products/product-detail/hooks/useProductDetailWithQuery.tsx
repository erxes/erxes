import { QueryHookOptions } from '@apollo/client';
import { useEffect } from 'react';
import { toast, useQueryState } from 'erxes-ui';
import { useProductDetail } from './useProductDetail';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';

export const useProductDetailWithQuery = (options?: QueryHookOptions) => {
  const [_id] = useQueryState<string>(PRODUCT_QUERY_KEY);

  const { productDetail, loading, error } = useProductDetail({
    ...options,
    variables: {
      _id,
    },
    skip: !_id,
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

  return { productDetail, loading, error };
};
