import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { IOrder } from '@/pos/types/order';
import { POS_ORDER_DETAIL_QUERY } from '../graphql/queries/posOrderDetailQuery';

export const usePosOrderDetail = () => {
  const [searchParams] = useSearchParams();
  const posOrderId = searchParams.get('pos_order_id');

  const { data, loading, error } = useQuery(POS_ORDER_DETAIL_QUERY, {
    variables: {
      id: posOrderId,
    },
    skip: !posOrderId,
  });

  if (error) {
    console.error('Error fetching order:', error);
  }

  return {
    order: data?.posOrderDetail as IOrder,
    loading,
    error,
  };
};
