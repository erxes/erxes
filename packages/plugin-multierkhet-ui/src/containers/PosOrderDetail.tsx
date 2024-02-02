import Detail from '../components/syncedOrders/PosOrderDetail';
import { gql } from '@apollo/client';
import React from 'react';
import { queries } from '../graphql';
import { OrderDetailQueryResponse } from '../types';
import { Spinner } from '@erxes/ui/src';
import { useQuery } from '@apollo/client';

type Props = {
  order: any;
};

const OrdersDetailContainer = (props: Props) => {
  const orderDetailQuery = useQuery<OrderDetailQueryResponse>(
    gql(queries.posOrderDetail),
    {
      variables: {
        _id: props.order._id,
      },
      fetchPolicy: 'network-only',
    },
  );

  if (orderDetailQuery.loading) {
    return <Spinner />;
  }

  const order = orderDetailQuery?.data?.posOrderDetail;

  const updatedProps = {
    ...props,
    order,
  };

  return <Detail {...updatedProps} />;
};

export default OrdersDetailContainer;
