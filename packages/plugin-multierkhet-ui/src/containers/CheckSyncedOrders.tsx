import * as compose from 'lodash.flowright';
import Alert from '@erxes/ui/src/utils/Alert';
import CheckSyncedOrders from '../components/syncedOrders/CheckSyncedOrders';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Bulk } from '@erxes/ui/src/components';
import {
  CheckSyncedMutationResponse,
  CheckSyncedOrdersQueryResponse,
  CheckSyncedOrdersTotalCountQueryResponse,
  PosListQueryResponse,
  ToSyncOrdersMutationResponse
} from '../types';
import { graphql } from '@apollo/client/react/hoc';
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
  posListQuery: PosListQueryResponse;
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
      toMultiCheckSynced,
      toMultiSyncOrders,
      checkSyncItemsQuery,
      checkSyncedOrdersTotalCountQuery,
      posListQuery
    } = this.props;

    // remove action
    const checkSynced = async ({ orderIds }, emptyBulk) => {
      await toMultiCheckSynced({
        variables: { ids: orderIds, type: 'pos' }
      })
        .then(response => {
          emptyBulk();
          const syncedOrderInfos: any[] = [];
          const items: any[] = response.data.toMultiCheckSynced;

          const unSyncedOrderIds: string[] = items
            .filter(item => {
              const brands = item.mustBrands || [];
              for (const b of brands) {
                if (!item[b]) {
                  return true;
                }
              }
              return false;
            })
            .map(i => i._id);

          items.forEach(item => {
            syncedOrderInfos[item._id] = item;
          });
          this.setState({ unSyncedOrderIds, syncedOrderInfos });
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const toSyncOrders = orderIds => {
      toMultiSyncOrders({
        variables: { orderIds }
      })
        .then(response => {
          const { skipped, error, success } = response.data.toMultiSyncOrders;
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
      checkSyncedOrdersTotalCountQuery.loading ||
      posListQuery.loading
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
      toSyncOrders,
      posList: posListQuery.posList
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
    userId: queryParams.user,
    posId: queryParams.pos,
    search: queryParams.search,
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
        name: 'toMultiCheckSynced'
      }
    ),
    graphql<Props, ToSyncOrdersMutationResponse, { orderIds: string[] }>(
      gql(mutations.toSyncOrders),
      {
        name: 'toMultiSyncOrders'
      }
    ),

    graphql<{ queryParams: any }, PosListQueryResponse>(
      gql(`query posList {
        posList {
          _id
          name
          description
        }
      }`),
      {
        name: 'posListQuery'
      }
    )
  )(withRouter<IRouterProps>(CheckSyncedOrdersContainer))
);
