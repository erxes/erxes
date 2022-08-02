import React from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import ListComponent from '../components/List';

const ListContainer = () => {
  const transactionsQuery = useQuery(gql(queries.transactions), {
    fetchPolicy: 'network-only'
  });

  return (
    <ListComponent
      loading={transactionsQuery.loading}
      data={transactionsQuery.data ? transactionsQuery.data.transactions : []}
    />
  );
};

export default ListContainer;
