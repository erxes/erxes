import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { useQuery } from 'react-apollo';

import List from '../../components/department/List';
import { queries } from '../../graphql';

export default function ListContainer() {
  const listQuery = useQuery(gql(queries.departments));

  if (listQuery.loading) {
    return <Spinner />;
  }

  return <List listQuery={listQuery} />;
}
