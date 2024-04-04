import * as compose from 'lodash.flowright';
import Detail from '../components/Detail';
import { gql } from '@apollo/client';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { PosOrderChangePaymentsMutationResponse } from '../types';
import { OrderDetailQueryResponse } from '../types';
import { Spinner, withProps } from '@erxes/ui/src';
import queries from '../graphql/queries';

type Props = {
  invoice: any;
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

  render() {
    const { orderDetailQuery } = this.props;

    if (orderDetailQuery && orderDetailQuery.loading) {
      return <Spinner />;
    }

    if (!orderDetailQuery) {
      return <></>;
    }

    const order = orderDetailQuery.posOrderDetail;

    if (!order) {
      return <>Pos order not synced yet, only on posclient</>;
    }

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
        options: ({ invoice }) => ({
          variables: {
            _id: invoice.contentTypeId
          },
          fetchPolicy: 'network-only'
        }),
        skip: ({ invoice }) => invoice.contentType !== 'pos:orders'
      }
    )
  )(OrdersDetailContainer)
);
