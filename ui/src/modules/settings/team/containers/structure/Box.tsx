import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import { queries } from '../../graphql';
import Box from '../../components/structure/Box';

export default function BoxContainer() {
  const { data, loading, refetch } = useQuery(gql(queries.structureDetail), {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <div>...</div>;
  }

  return <Box refetch={refetch} structure={data.structureDetail} />;
}
