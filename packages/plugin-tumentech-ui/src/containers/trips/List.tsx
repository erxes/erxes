import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../../components/trips/List';
import { queries } from '../../graphql';
import { router } from '@erxes/ui/src';

type Props = {
  queryParams: any;
};

const TripListContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.trips), {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  const trips = (data && data.trips.list) || [];

  const totalCount = (data && data.trips.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    trips,
    totalCount
  };

  return <List {...extendedProps} />;
};

export default TripListContainer;
