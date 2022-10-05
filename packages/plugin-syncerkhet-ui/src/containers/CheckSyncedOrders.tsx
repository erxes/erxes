import * as compose from 'lodash.flowright';
import Alert from '@erxes/ui/src/utils/Alert';
import CheckSyncedOrders from '../components/syncedOrders/CheckSyncedOrders';
import gql from 'graphql-tag';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Bulk } from '@erxes/ui/src/components';
import {
  CheckSyncedMutationResponse,
  CheckSyncedOrdersQueryResponse,
  CheckSyncedOrdersTotalCountQueryResponse,
  ToSyncOrdersMutationResponse
} from '../types';
import { graphql } from 'react-apollo';
import { IRouterProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import { router, withProps } from '@erxes/ui/src/utils/core';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  checkSyncItemsQuery: CheckSyncedOrdersQueryResponse;
  checkSyncedOrdersTotalCountQuery: CheckSyncedOrdersTotalCountQueryResponse;
} & Props &
  IRouterProps &
  CheckSyncedMutationResponse &
  ToSyncOrdersMutationResponse;

type State = {
  unSyncedOrderIds: string[];
  syncedOrderInfos: any;
};

class CheckSyncedOrdersContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      unSyncedOrderIds: [],
      syncedOrderInfos: {}
    };
  }

  render() {
    const {
      toCheckSynced,
      checkSyncItemsQuery,
      checkSyncedOrdersTotalCountQuery
    } = this.props;

    // remove action
    const checkSynced = async ({ orderIds }, emptyBulk) => {
      await toCheckSynced({
        variables: { ids: orderIds }
      })
        .then(response => {
          emptyBulk();
          const statuses = response.data.toCheckSynced;

          const unSyncedOrderIds = (
            statuses.filter(s => !s.isSynced) || []
          ).map(s => s._id);
          const syncedOrderInfos = {};
          const syncedOrders = statuses.filter(s => s.isSynced) || [];

          syncedOrders.forEach(item => {
            syncedOrderInfos[item._id] = {
              syncedBillNumber: item.syncedBillNumber || '',
              syncedDate: item.syncedDate || ''
            };
          });

          this.setState({ unSyncedOrderIds, syncedOrderInfos });
          Alert.success('Check finished');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const toSyncOrders = orderIds => {
      this.props
        .toSyncOrders({
          variables: { orderIds }
        })
        .then(response => {
          const { skipped, error, success } = response.data.toSyncOrders;
          const changed = this.state.unSyncedOrderIds.filter(
            u => !orderIds.includes(u)
          );
          this.setState({ unSyncedOrderIds: changed });
          Alert.success(
            `Алгассан: ${skipped.length}, Алдаа гарсан: ${error.length}, Амжилттай: ${success.length}`
          );
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    if (
      checkSyncItemsQuery.loading ||
      checkSyncedOrdersTotalCountQuery.loading
    ) {
      return <Spinner />;
    }
    const orders = checkSyncItemsQuery.posOrders || [];
    const totalCount =
      checkSyncedOrdersTotalCountQuery.posOrdersTotalCount || 0;

    const updatedProps = {
      ...this.props,
      loading: checkSyncItemsQuery.loading,
      orders,
      totalCount,
      checkSynced,
      unSyncedOrderIds: this.state.unSyncedOrderIds,
      syncedOrderInfos: this.state.syncedOrderInfos,
      toSyncOrders
    };

    const content = props => <CheckSyncedOrders {...props} {...updatedProps} />;

    return <Bulk content={content} />;
  }
}

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    paidStartDate: queryParams.paidStartDate,
    paidEndDate: queryParams.paidEndDate,
    createdStartDate: queryParams.createdStartDate,
    createdEndDate: queryParams.createdEndDate,
    posToken: queryParams.posToken,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20
  };
};

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, CheckSyncedOrdersQueryResponse>(
      gql(queries.checkSyncOrders),
      {
        name: 'checkSyncItemsQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<{ queryParams: any }, CheckSyncedOrdersTotalCountQueryResponse>(
      gql(queries.checkSyncOrdersTotalCount),
      {
        name: 'checkSyncedOrdersTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, CheckSyncedMutationResponse, { orderIds: string[] }>(
      gql(mutations.toCheckSynced),
      {
        name: 'toCheckSynced'
      }
    ),
    graphql<Props, ToSyncOrdersMutationResponse, { orderIds: string[] }>(
      gql(mutations.toSyncOrders),
      {
        name: 'toSyncOrders'
      }
    )
  )(withRouter<IRouterProps>(CheckSyncedOrdersContainer))
);
