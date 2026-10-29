import { toPosOrderDetail } from '@/pos/utils/posOrderJson';
import { WatchQueryFetchPolicy, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { POS_ORDER_DETAIL_QUERY } from '../graphql/queries/posOrderDetailQuery';

export const usePosOrderQuery = (
  id?: string,
  fetchPolicy: WatchQueryFetchPolicy = 'cache-and-network',
) => {
  const { data, loading, error, refetch } = useQuery(POS_ORDER_DETAIL_QUERY, {
    variables: id ? { id } : undefined,
    skip: !id,
    fetchPolicy,
  });

  const parsed = useMemo(() => {
    try {
      return {
        value: data?.posOrderDetail
          ? toPosOrderDetail(data.posOrderDetail)
          : undefined,
      };
    } catch (cause) {
      return {
        error: cause instanceof Error ? cause : new Error(String(cause)),
      };
    }
  }, [data?.posOrderDetail]);

  return {
    posOrder: parsed.value,
    loading,
    error: error ?? parsed.error,
    refetch,
  };
};
