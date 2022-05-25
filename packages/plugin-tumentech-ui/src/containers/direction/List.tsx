import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../../components/direction/Props';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries } from '../../graphql';

type Props = {
  refetch: () => void;
};

export default function ItemContainer(props: Props) {
  const { data, loading } = useQuery(gql(queries.directions), {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  return <List {...props} directions={data.directions} />;
}
