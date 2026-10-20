import { toPosOrderDetail } from '@/pos/utils/posOrderJson';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { POS_ITEM_DETAIL_QUERY } from '../graphql/queries/posItemDetailQuery';

export const usePosItemDetail = () => {
  const [searchParams] = useSearchParams();
  const posItemId = searchParams.get('pos_order_id');

  const posOrderId = posItemId?.split('_')[0];

  const { data, loading, error, refetch } = useQuery(POS_ITEM_DETAIL_QUERY, {
    variables: {
      _id: posOrderId,
    },
    skip: !posOrderId,
  });

  if (error) {
    console.error('Error fetching pos item:', error);
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
    posItem: parsed.value,
    loading,
    error: error ?? parsed.error,
    refetch,
  };
};
