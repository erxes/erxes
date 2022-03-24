import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import Detail from '../components/Detail';
import React from 'react';
import { graphql } from 'react-apollo';
import { IOrder } from '../types';
import { OrderDetailQueryResponse } from '../types';
import { queries } from '../graphql';
import { Spinner, withProps } from '@erxes/ui/src';

type Props = {
  order: IOrder
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
    const {
      orderDetailQuery
    } = this.props;

    if (orderDetailQuery.loading) {
      return <Spinner />
    }

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
          }
        })
      }
    ),
  )(OrdersDetailContainer)
);