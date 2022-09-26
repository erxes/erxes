import * as compose from 'lodash.flowright';
import Alert from '@erxes/ui/src/utils/Alert';
import CheckSyncedDeals from '../components/syncedDeals/CheckSyncedDeals';
import gql from 'graphql-tag';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Bulk } from '@erxes/ui/src/components';
import {
  CheckSyncedMutationResponse,
  CheckSyncedDealsQueryResponse,
  CheckSyncedDealsTotalCountQueryResponse,
  ToSyncDealsMutationResponse
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
  checkSyncItemsQuery: CheckSyncedDealsQueryResponse;
  checkSyncedDealsTotalCountQuery: CheckSyncedDealsTotalCountQueryResponse;
} & Props &
  IRouterProps &
  CheckSyncedMutationResponse &
  ToSyncDealsMutationResponse;

type State = {
  unSyncedDealIds: string[];
  syncedDealInfos: any;
};

class CheckSyncedDealsContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      unSyncedDealIds: [],
      syncedDealInfos: {}
    };
  }

  render() {
    const {
      toCheckSynced,
      checkSyncItemsQuery,
      checkSyncedDealsTotalCountQuery
    } = this.props;

    // remove action
    const checkSynced = async ({ dealIds }, emptyBulk) => {
      await toCheckSynced({
        variables: { ids: dealIds }
      })
        .then(response => {
          emptyBulk();
          const statuses = response.data.toCheckSynced;

          const unSyncedDealIds = (statuses.filter(s => !s.isSynced) || []).map(
            s => s._id
          );
          const syncedDealInfos = {};
          const syncedDeals = statuses.filter(s => s.isSynced) || [];

          syncedDeals.forEach(item => {
            syncedDealInfos[item._id] = {
              syncedBillNumber: item.syncedBillNumber || '',
              syncedDate: item.syncedDate || ''
            };
          });
          this.setState({ unSyncedDealIds, syncedDealInfos });
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const toSyncDeals = dealIds => {
      this.props
        .toSyncDeals({
          variables: { dealIds }
        })
        .then(response => {
          const { skipped, error, success } = response.data.toSyncDeals;
          const changed = this.state.unSyncedDealIds.filter(
            u => !dealIds.includes(u)
          );
          this.setState({ unSyncedDealIds: changed });
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
      checkSyncedDealsTotalCountQuery.loading
    ) {
      return <Spinner />;
    }

    const deals = checkSyncItemsQuery.deals || [];
    const totalCount = checkSyncedDealsTotalCountQuery.dealsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      loading: checkSyncItemsQuery.loading,
      deals,
      totalCount,
      checkSynced,
      unSyncedDealIds: this.state.unSyncedDealIds,
      syncedDealInfos: this.state.syncedDealInfos,
      toSyncDeals
    };

    const content = props => <CheckSyncedDeals {...props} {...updatedProps} />;

    return <Bulk content={content} />;
  }
}

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    limit: pageInfo.perPage || 10,
    skip: pageInfo.page > 1 ? (pageInfo.page - 1) * pageInfo.perPage : 0,
    pipelineId: queryParams.pipelineId,
    noSkipArchive: true,
    stageId: queryParams.stageId,
    stageChangedStartDate: queryParams.stageChangedStartDate,
    stageChangedEndDate: queryParams.stageChangedEndDate,
    assignedUserIds: queryParams.userId && [queryParams.userId],
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined
  };
};

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, CheckSyncedDealsQueryResponse>(
      gql(queries.checkSyncDeals),
      {
        name: 'checkSyncItemsQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<{ queryParams: any }, CheckSyncedDealsTotalCountQueryResponse>(
      gql(queries.checkSyncDealsTotalCount),
      {
        name: 'checkSyncedDealsTotalCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, CheckSyncedMutationResponse, { dealIds: string[] }>(
      gql(mutations.toCheckSynced),
      {
        name: 'toCheckSynced'
      }
    ),
    graphql<Props, ToSyncDealsMutationResponse, { dealIds: string[] }>(
      gql(mutations.toSyncDeals),
      {
        name: 'toSyncDeals'
      }
    )
  )(withRouter<IRouterProps>(CheckSyncedDealsContainer))
);
