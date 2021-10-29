import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import List from '../../components/branch/List';
import { queries } from '../../graphql';

export default function ListContainer() {
  const listQuery = useQuery(gql(queries.branches));

  if (listQuery.loading) {
    return null;
  }

  return <List listQuery={listQuery} />;
}
