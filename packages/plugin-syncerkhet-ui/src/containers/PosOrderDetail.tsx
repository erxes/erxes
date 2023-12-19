import * as compose from 'lodash.flowright';

import Detail from '../components/syncedOrders/PosOrderDetail';
import { OrderDetailQueryResponse } from '../types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src';

type Props = {
  order: any;
};

type FinalProps = {
  orderDetailQuery: OrderDetailQueryResponse;
} & Props;

class OrdersDetailContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { orderDetailQuery } = this.props;

    const order = orderDetailQuery.posOrderDetail;

    const updatedProps = {
      ...this.props,
      order
    };

    return <Detail {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, OrderDetailQueryResponse, { _id: string }>(
      gql(queries.posOrderDetail),
      {
        name: 'orderDetailQuery',
        options: ({ order }) => ({
          variables: {
            _id: order._id
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(OrdersDetailContainer)
);
