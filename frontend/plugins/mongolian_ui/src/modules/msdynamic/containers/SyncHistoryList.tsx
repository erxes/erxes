import React from 'react';
import { gql, useQuery } from '@apollo/client';
import SyncHistoryList from '../components/SyncHistoryList';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
};

const generateParams = (queryParams: any) => {
  return {
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
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

const SyncHistoryListContainer = ({ queryParams }: Props) => {
  const variables = generateParams(queryParams);

  const { data: historiesData, loading: historiesLoading } = useQuery(
    gql(queries.syncMsdHistories),
    {
      variables,
      fetchPolicy: 'network-only',
    },
  );

  const { data: countData, loading: countLoading } = useQuery(
    gql(queries.syncMsdHistoriesCount),
    {
      variables,
      fetchPolicy: 'network-only',
    },
  );

  const loading = historiesLoading || countLoading;

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground">Loading...</div>
    );
  }

  const syncHistories = historiesData?.syncMsdHistories || [];
  const totalCount = countData?.syncMsdHistoriesCount || 0;

  return (
    <SyncHistoryList
      queryParams={queryParams}
      syncHistories={syncHistories}
      totalCount={totalCount}
      loading={loading}
    />
  );
};

export default SyncHistoryListContainer;
