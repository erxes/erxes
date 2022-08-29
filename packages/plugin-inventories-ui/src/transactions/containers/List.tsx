import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
// erxes
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
// local
import { queries } from '../graphql';
import ListComponent from '../components/List';

const ListContainer = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const transactionsQuery = useQuery(gql(queries.transactions), {
    variables: {
      ...generatePaginationParams(queryParams)
    },
    fetchPolicy: 'network-only'
  });

  return (
    <ListComponent
      loading={transactionsQuery.loading}
      data={transactionsQuery.data ? transactionsQuery.data.transactions : []}
    />
  );
};

export default compose()(ListContainer);
