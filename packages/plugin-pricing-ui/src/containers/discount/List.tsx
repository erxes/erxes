import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
// local
import { queries } from '../../graphql';
import ListComponent from '../../components/discount/List';

const ListContainer = () => {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { status = '' } = query;

  const discounts = useQuery(gql(queries.discounts), {
    variables: { status },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  return (
    <ListComponent
      data={discounts.data ? discounts.data.discounts : []}
      loading={discounts.loading}
      refetch={discounts.refetch}
    />
  );
};

export default ListContainer;
