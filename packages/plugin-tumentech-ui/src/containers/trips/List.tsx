import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../../components/trips/List';
import { mutations, queries } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { router } from '@erxes/ui/src';

type Props = {
  // refetch: () => void;
  queryParams: any;
};

const TripListContainer = (props: Props) => {
  const { data, loading, refetch } = useQuery(gql(queries.trips), {
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
    // refetch,
  };

  return <List {...extendedProps} />;
};

export default TripListContainer;
