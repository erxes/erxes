import { gql, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';

import { queries } from '../graphql';
import { PosOrderDetail } from '../msdynamic-check-orders/components/PosOrderDetail';
import { IPosOrderDetail } from '../msdynamic-check-orders/types/msDynamicCheckOrder';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

type Props = {
  order: IPosOrderDetail;
};

const OrdersDetailContainer = ({ order }: Props) => {
  const [orderDetailId] = useQueryState<string>(ORDER_DETAIL_ID_KEY);
  const isActive = Boolean(orderDetailId) && orderDetailId === order?._id;

  const { data, error } = useQuery(gql(queries.posOrderDetail), {
    variables: { _id: order?._id },
    fetchPolicy: 'network-only',
    skip: !order?._id || !isActive,
  });

  if (error) {
    return null;
  }

  const orderDetail = data?.posOrderDetail || order;

  return <PosOrderDetail orders={orderDetail} />;
};

export { OrdersDetailContainer };
