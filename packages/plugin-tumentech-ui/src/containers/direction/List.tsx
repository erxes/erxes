import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../../components/direction/List';
// import Spinner from '@erxes/ui/src/components/Spinner';
import { queries } from '../../graphql';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ItemContainer(props: Props) {
  const { data, loading } = useQuery(gql(queries.directions), {
    fetchPolicy: 'network-only'
  });

  // if (loading) {
  //   return <Spinner />;
  // }

  const remove = () => {
    console.log('remove');
  };

  const directions = (data && data.directions) || [];

  const extendedProps = {
    ...props,
    loading,
    directions,
    totalCount: directions.length,
    remove
  };

  return <List {...extendedProps} />;
}
