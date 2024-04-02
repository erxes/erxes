import { gql } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import { router } from '@erxes/ui/src/utils/core';
import React from 'react';
import SyncHistoryList from '../components/SyncHistoryList';
import { queries } from '../graphql';
import {
  SyncHistoriesCountQueryResponse,
  SyncHistoriesQueryResponse,
} from '../types';
import { useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
};

const SyncHistoryListContainer = (props: Props) => {
  const { queryParams } = props;

  const syncHistoriesQuery = useQuery<SyncHistoriesQueryResponse>(
    gql(queries.syncHistories),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  const syncHistoriesCountQuery = useQuery<SyncHistoriesCountQueryResponse>(
    gql(queries.syncHistoriesCount),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: 'network-only',
    },
  );

  if (syncHistoriesQuery.loading || syncHistoriesCountQuery.loading) {
    return <Spinner />;
  }

  const syncHistories = syncHistoriesQuery?.data?.manySyncHistories || [];
  const totalCount = syncHistoriesCountQuery?.data?.manySyncHistoriesCount || 0;

  const updatedProps = {
    ...props,
    queryParams,
    syncHistories,
    totalCount,
  };

  return <SyncHistoryList {...updatedProps} />;
};

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
    searchError: queryParams.searchError,
  };
};

export default SyncHistoryListContainer;
