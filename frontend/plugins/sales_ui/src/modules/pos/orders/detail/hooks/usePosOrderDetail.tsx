import { toPosOrderDetail } from '@/pos/utils/posOrderJson';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { POS_ORDER_DETAIL_QUERY } from '../graphql/queries/posOrderDetailQuery';

export const usePosOrderDetail = () => {
  const [searchParams] = useSearchParams();
  const posOrderId = searchParams.get('pos_order_id');

  const { data, loading, error } = useQuery(POS_ORDER_DETAIL_QUERY, {
    variables: posOrderId ? { id: posOrderId } : undefined,
    skip: !posOrderId,
  });

  if (error) {
    console.error('Error fetching order:', error);
  }

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
    order: parsed.value,
    loading,
    error: error ?? parsed.error,
  };
};
