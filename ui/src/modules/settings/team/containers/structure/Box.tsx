import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import { queries } from '../../graphql';
import Box from '../../components/structure/Box';
import Spinner from 'modules/common/components/Spinner';

export default function BoxContainer() {
  const { data, loading, refetch } = useQuery(gql(queries.structureDetail), {
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  return <Box refetch={refetch} structure={data.structureDetail} />;
}
