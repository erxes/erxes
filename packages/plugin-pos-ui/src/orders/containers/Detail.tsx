import * as compose from 'lodash.flowright';
import Detail from '../components/Detail';
import { gql } from '@apollo/client';
import React from 'react';
import { Alert } from '@erxes/ui/src/utils';
import { graphql } from '@apollo/client/react/hoc';
import { IOrder, PosOrderChangePaymentsMutationResponse } from '../types';
import { mutations, queries } from '../graphql';
import { OrderDetailQueryResponse } from '../types';
import { PosDetailQueryResponse } from '../../types';
import { queries as posQueries } from '../../pos/graphql';
import { Spinner, withProps } from '@erxes/ui/src';

type Props = {
  order: IOrder;
};

type FinalProps = {
  orderDetailQuery: OrderDetailQueryResponse;
  posDetailQuery: PosDetailQueryResponse;
} & Props &
  PosOrderChangePaymentsMutationResponse;

class OrdersDetailContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onChangePayments = (orderId, cashAmount, mobileAmount, paidAmounts) => {
    const { posOrderChangePayments } = this.props;

    posOrderChangePayments({
      variables: {
        _id: orderId,
        cashAmount,
        mobileAmount,
        paidAmounts
      }
    })
      .then(() => {
        Alert.success('You successfully synced erkhet.');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { orderDetailQuery, posDetailQuery } = this.props;

    if (orderDetailQuery.loading || posDetailQuery.loading) {
      return <Spinner />;
    }

    const order = orderDetailQuery.posOrderDetail;
    const pos = posDetailQuery.posDetail;

    const updatedProps = {
      ...this.props,
      onChangePayments: this.onChangePayments,
      pos,
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
    graphql<Props, PosDetailQueryResponse, {}>(gql(posQueries.posDetail), {
      name: 'posDetailQuery',
      options: props => ({
        variables: {
          _id: props.order.posToken
        }
      })
    }),
    graphql<
      Props,
      PosOrderChangePaymentsMutationResponse,
      {
        _id: string;
        cashAmount: number;
        mobileAmount: number;
        paidAmounts: any;
      }
    >(gql(mutations.posOrderChangePayments), {
      name: 'posOrderChangePayments',
      options: () => ({
        refetchQueries: ['posOrders', 'posOrdersSummary', 'posOrderDetail']
      })
    })
  )(OrdersDetailContainer)
);
