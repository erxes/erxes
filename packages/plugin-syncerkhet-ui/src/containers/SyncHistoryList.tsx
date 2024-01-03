import * as compose from 'lodash.flowright';

import {
  SyncHistoriesCountQueryResponse,
  SyncHistoriesQueryResponse
} from '../types';
import { router, withProps } from '@erxes/ui/src/utils/core';

import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import SyncHistoryList from '../components/syncHistories/SyncHistoryList';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { withRouter } from 'react-router-dom';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  syncHistoriesQuery: SyncHistoriesQueryResponse;
  syncHistoriesCountQuery: SyncHistoriesCountQueryResponse;
} & Props &
  IRouterProps;

class SyncHistoryListContainer extends React.Component<FinalProps, {}> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      queryParams,
      syncHistoriesQuery,
      syncHistoriesCountQuery
    } = this.props;

    const syncHistories = syncHistoriesQuery.syncHistories || [];
    const totalCount = syncHistoriesCountQuery.syncHistoriesCount || 0;

    const updatedProps = {
      ...this.props,
      queryParams,
      syncHistories,
      totalCount,
      loading: syncHistoriesQuery.loading || syncHistoriesCountQuery.loading
    };

    return <SyncHistoryList {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    page: pageInfo.page || 1,
    perPage: pageInfo.perPage || 20,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    userId: queryParams.userId,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    contentType: queryParams.contentType,
    contentId: queryParams.contentId,
    searchConsume: queryParams.searchConsume,
    searchSend: queryParams.searchSend,
    searchResponse: queryParams.searchResponse,
    searchError: queryParams.searchError
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, SyncHistoriesQueryResponse, {}>(gql(queries.syncHistories), {
      name: 'syncHistoriesQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, SyncHistoriesCountQueryResponse, {}>(
      gql(queries.syncHistoriesCount),
      {
        name: 'syncHistoriesCountQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    )
  )(withRouter<IRouterProps>(SyncHistoryListContainer))
);
