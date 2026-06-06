import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { IPosItem } from '@/pos/pos-items/types/posItem';
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

  return {
    posItem: data?.posOrderDetail as IPosItem,
    loading,
    error,
    refetch,
  };
};
