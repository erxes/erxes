import { useQuery } from '@apollo/client';
import { POS_ORDER_DETAIL_QUERY } from '../graphql/queries/posOrderDetailQuery';
import { TPosOrder } from '../../types/posOrderType';

export const usePosOrderQuery = (id?: string) => {
  const { data, loading, error } = useQuery<{
    posOrderDetail: TPosOrder;
  }>(POS_ORDER_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    posOrder: data?.posOrderDetail,
    loading,
    error,
  };
};
