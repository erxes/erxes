import * as compose from 'lodash.flowright';

import Detail from '../components/syncedOrders/PosOrderDetail';
import { OrderDetailQueryResponse } from '../types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  order: any;
};

type FinalProps = {
  orderDetailQuery: OrderDetailQueryResponse;
} & Props;

const OrdersDetailContainer = (props: FinalProps) => {
  const { orderDetailQuery } = props;

  if (orderDetailQuery.loading) {
    return <Spinner />;
  }

  const order = orderDetailQuery.posOrderDetail;

  const updatedProps = {
    ...props,
    order,
  };

  return <Detail {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, OrderDetailQueryResponse, { _id: string }>(
      gql(queries.posOrderDetail),
      {
        name: 'orderDetailQuery',
        options: ({ order }) => ({
          variables: {
            _id: order._id,
          },
          fetchPolicy: 'network-only',
        }),
      }
    )
  )(OrdersDetailContainer)
);
