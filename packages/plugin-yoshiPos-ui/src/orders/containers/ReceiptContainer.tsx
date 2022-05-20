import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import withCurrentUser from '../../auth/containers/withCurrentUser';
import Spinner from '../../common/components/Spinner';
import { IRouterProps } from '../../types';
import { withProps } from '../../utils';
import { queries } from '../graphql/index';
import Receipt from '../components/receipt/Receipt';
import InnerReceipt from '../components/receipt/InnerReceipt';
import { OrderDetailQueryResponse } from '../types';
import KitchenReceipt from '../components/receipt/KitchenReceipt';

type Props = {
  id: string;
  kitchen: string;
  inner: string;
};

type FinalProps = {
  orderDetailQuery: OrderDetailQueryResponse;
} & Props &
  IRouterProps;

class ReceiptContainer extends React.Component<FinalProps> {
  render() {
    const { orderDetailQuery, kitchen, inner } = this.props;

    if (orderDetailQuery.loading) {
      return <Spinner />;
    }

    const order = orderDetailQuery.orderDetail;

    if (kitchen === 'true') {
      return <KitchenReceipt order={order} />;
    }

    if (inner === 'true') {
      return <InnerReceipt order={order} />;
    }

    return <Receipt order={order} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, OrderDetailQueryResponse>(gql(queries.orderDetail), {
      name: 'orderDetailQuery',
      options: ({ id }) => ({
        variables: { _id: id }
      })
    })
  )(withCurrentUser(withRouter<FinalProps>(ReceiptContainer)))
);
