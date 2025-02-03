import { router } from '@erxes/ui/src/utils/core';

import { gql, useQuery } from '@apollo/client';
import React from 'react';
import ScoreLogsListComponent from '../components/List';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
};

const generateParams = ({ queryParams }: { queryParams: any }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.orderType,
  sortDirection: Number(queryParams.order) || undefined,
  fromDate: queryParams.fromDate,
  toDate: queryParams.toDate,
});

const ScoreLogsListContainer = (props: Props) => {
  const { queryParams } = props;

  const { data, loading, refetch } = useQuery(gql(queries.getScoreLogs), {
    variables: generateParams({ queryParams }),
  });

  const { data: statistic } = useQuery(gql(queries.getScoreLogStatistics), {
    variables: generateParams({ queryParams }),
  });

  const { list, total } = data?.scoreLogList || {};

  const updatedProps = {
    ...props,
    scoreLogs: list || [],
    statistics: statistic?.scoreLogStatistics || {},
    total: total || 0,
    loading: loading,
    refetch,
  };

  return <ScoreLogsListComponent {...updatedProps} />;
};

export default ScoreLogsListContainer;
