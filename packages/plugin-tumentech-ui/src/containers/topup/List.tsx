import { router } from '@erxes/ui/src';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import List from '../../components/topup/List';
import { queries } from '../../graphql';

type Props = {
  queryParams: any;
};

const TripListContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.topupList), {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  const topups = (data && data.topupHistory.list) || [];

  const totalCount = (data && data.topupHistory.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    topups,
    totalCount
  };

  return <List {...extendedProps} />;
};

export default TripListContainer;
