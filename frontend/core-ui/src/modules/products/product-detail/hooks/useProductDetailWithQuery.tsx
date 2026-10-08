import { QueryHookOptions } from '@apollo/client';
import { useEffect } from 'react';
import { toast, useQueryState } from 'erxes-ui';
import { useProductDetail } from './useProductDetail';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';
import { useTranslation } from 'react-i18next';

export const useProductDetailWithQuery = (options?: QueryHookOptions) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const [_id] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const queryProductId = _id ?? undefined;
  const shouldSkip = !queryProductId || !!options?.skip;

  const { productDetail, productId, loading, error, refetch } =
    useProductDetail({
      ...options,
      variables: {
        ...options?.variables,
        _id: queryProductId,
      },
      skip: shouldSkip,
    });

  useEffect(() => {
    if (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, t]);

  return { productDetail, productId, loading, error, refetch };
};
