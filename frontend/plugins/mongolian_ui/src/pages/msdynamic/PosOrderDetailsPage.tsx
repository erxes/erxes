import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryState } from 'erxes-ui';
import { OrdersDetailContainer } from '@/msdynamic/containers/PosOrderDetail';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

export const PosOrderDetailsPage = () => {
  const { id } = useParams();
  const [, setOrderDetailId] = useQueryState<string>(ORDER_DETAIL_ID_KEY);

  useEffect(() => {
    if (id) setOrderDetailId(id);
  }, [id, setOrderDetailId]);

  if (!id) return null;

  return <OrdersDetailContainer order={{ _id: id }} />;
};
