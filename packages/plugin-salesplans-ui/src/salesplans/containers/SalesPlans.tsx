import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import queryString from 'query-string';
import SalesPlansComponent from '../components/SalesPlans';

const SalesPlansContainer = () => {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { type = '', status = '' } = query;

  const salesLogs = useQuery(gql(queries.salesLogs), {
    variables: { type, status },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  return (
    <SalesPlansComponent
      data={salesLogs.data ? salesLogs.data.salesLogs : []}
      loading={salesLogs.loading}
      refetch={salesLogs.refetch}
    />
  );
};

export default SalesPlansContainer;
