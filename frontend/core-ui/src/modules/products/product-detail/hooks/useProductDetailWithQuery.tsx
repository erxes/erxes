import { QueryHookOptions } from '@apollo/client';
import { renderingProductDetailAtom } from '@/products/states/productDetailStates';
import { useSetAtom } from 'jotai';
import { toast, useQueryState } from 'erxes-ui';
import { useProductDetail } from './useProductDetail';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';
import { useEffect } from 'react';

export const useProductDetailWithQuery = (options?: QueryHookOptions) => {
  const [_id] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const setRendering = useSetAtom(renderingProductDetailAtom);

  const { productDetail, loading, error } = useProductDetail({
    ...options,
    variables: {
      _id,
    },
    skip: !_id,
  });

  useEffect(() => {
    if (productDetail || !loading || error) {
      setRendering(false);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  }, [productDetail, loading, error, setRendering]);

  return { productDetail, loading, error };
};
