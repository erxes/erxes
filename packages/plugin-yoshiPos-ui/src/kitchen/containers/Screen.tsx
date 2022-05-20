import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import React, { useEffect } from 'react';
import Screen from '../components/Screen';
import Spinner from '../../common/components/Spinner';
import withCurrentUser from '../../auth/containers/withCurrentUser';
import { Alert } from '../../common/utils';
import { graphql } from 'react-apollo';
import { IConfig, IRouterProps } from '../../types';
import { IUser } from '../../auth/types';
import { mutations, queries, subscriptions } from '../../orders/graphql';
import {
  FullOrderQueryResponse,
  OrderChangeStatusMutationResponse
} from '../../orders/types';
import { withProps } from '../../utils';
import { withRouter } from 'react-router-dom';

type Props = {
  orderQuery: FullOrderQueryResponse;
  orderDoneQuery: FullOrderQueryResponse;
  orderChangeStatusMutation: OrderChangeStatusMutationResponse;
  posCurrentUser: IUser;
  currentConfig: IConfig;
  qp: any;
} & IRouterProps;

function KitchenScreenContainer(props: Props) {
  const { orderQuery, orderDoneQuery, orderChangeStatusMutation } = props;

  useEffect(() => {
    return orderQuery.subscribeToMore({
      document: gql(subscriptions.ordersOrdered),
      variables: { statuses: ['paid', 'new', 'doing', 'done', 'complete'] },
      updateQuery: () => {
        orderQuery.refetch();
      }
    });
  });

  useEffect(() => {
    return orderDoneQuery.subscribeToMore({
      document: gql(subscriptions.ordersOrdered),
      variables: { statuses: ['paid', 'new', 'doing', 'done', 'complete'] },
      updateQuery: () => {
        orderDoneQuery.refetch();
      }
    });
  });

  if (orderQuery.loading || orderDoneQuery.loading) {
    return <Spinner />;
  }

  const editOrder = doc => {
    orderChangeStatusMutation({ variables: { ...doc } })
      .then(() => {
        Alert.success(`${doc.number} has been synced successfully.`);
        if (doc.status === 'done') {
          window.open(`/order-receipt/${doc._id}?kitchen=true`, '_blank');
        }
      })
      .catch(e => {
        return Alert.error(e.message);
      });
  };

  const orders = orderQuery.fullOrders || [];
  const doneOrders = orderDoneQuery.fullOrders || [];

  const updatedProps = {
    ...props,
    orders,
    doneOrders,
    editOrder
  };

  return <Screen {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props, FullOrderQueryResponse>(gql(queries.fullOrders), {
      name: 'orderQuery',
      options: () => ({
        variables: { statuses: ['paid', 'doing'] },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, FullOrderQueryResponse>(gql(queries.fullOrders), {
      name: 'orderDoneQuery',
      options: () => ({
        variables: {
          statuses: ['done'],
          perPage: 8,
          page: 1,
          sortField: 'modifiedAt',
          sortDirection: -1
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, OrderChangeStatusMutationResponse>(
      gql(mutations.orderChangeStatus),
      {
        name: 'orderChangeStatusMutation'
      }
    )
  )(withCurrentUser(withRouter<Props>(KitchenScreenContainer)))
);
