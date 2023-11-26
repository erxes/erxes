import * as compose from 'lodash.flowright';
import Alert from '@erxes/ui/src/utils/Alert';
import CheckSyncedDeals from '../components/syncedDeals/CheckSyncedDeals';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Bulk } from '@erxes/ui/src/components';
import {
  CheckSyncedMutationResponse,
  CheckSyncedDealsQueryResponse,
  CheckSyncedDealsTotalCountQueryResponse,
  ToSyncDealsMutationResponse
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
      toMultiCheckSynced,
      toMultiSyncDeals,
      checkSyncItemsQuery,
      checkSyncedDealsTotalCountQuery
    } = this.props;

    // remove action
    const checkSynced = async ({ dealIds }, emptyBulk) => {
      await toMultiCheckSynced({
        variables: { ids: dealIds, type: 'deal' }
      })
        .then(response => {
          emptyBulk();
          const items = response.data.toMultiCheckSynced;
          const unSyncedDealIds: string[] = items
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

          const syncedDealInfos: any[] = [];

          items.forEach(item => {
            syncedDealInfos[item._id] = item;
          });
          this.setState({ unSyncedDealIds, syncedDealInfos });
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const toSyncDeals = (dealIds, configStageId, dateType) => {
      toMultiSyncDeals({
        variables: { dealIds, configStageId, dateType }
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
    search: queryParams.search,
    number: queryParams.number,
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
        name: 'toMultiCheckSynced'
      }
    ),
    graphql<Props, ToSyncDealsMutationResponse, { dealIds: string[] }>(
      gql(mutations.toSyncDeals),
      {
        name: 'toMultiSyncDeals'
      }
    )
  )(withRouter<IRouterProps>(CheckSyncedDealsContainer))
);
