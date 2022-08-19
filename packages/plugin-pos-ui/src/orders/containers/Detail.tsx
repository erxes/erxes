import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import Detail from '../components/Detail';
import React from 'react';
import { graphql } from 'react-apollo';
import { IOrder, PosOrderChangePaymentsMutationResponse } from '../types';
import { OrderDetailQueryResponse } from '../types';
import { queries, mutations } from '../graphql';
import { Spinner, withProps } from '@erxes/ui/src';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  order: IOrder;
};

type FinalProps = {
  orderDetailQuery: OrderDetailQueryResponse;
} & Props &
  PosOrderChangePaymentsMutationResponse;

class OrdersDetailContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onChangePayments = (orderId, cashAmount, cardAmount, mobileAmount) => {
    const { posOrderChangePayments } = this.props;

    posOrderChangePayments({
      variables: { _id: orderId, cashAmount, cardAmount, mobileAmount }
    })
      .then(() => {
        Alert.success('You successfully synced erkhet.');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { orderDetailQuery } = this.props;

    if (orderDetailQuery.loading) {
      return <Spinner />;
    }

    const order = orderDetailQuery.posOrderDetail;

    const updatedProps = {
      ...this.props,
      onChangePayments: this.onChangePayments,
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
    ),
    graphql<
      Props,
      PosOrderChangePaymentsMutationResponse,
      {
        _id: string;
        cashAmount: number;
        cardAmount: number;
        mobileAmount: number;
      }
    >(gql(mutations.posOrderChangePayments), {
      name: 'posOrderChangePayments',
      options: () => ({
        refetchQueries: ['posOrders', 'posOrdersSummary', 'posOrderDetail']
      })
    })
  )(OrdersDetailContainer)
);
