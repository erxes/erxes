import React from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import SalesPlansComponent from '../components/SalesPlans';

const SalesPlansContainer = () => {
  const salesLogs = useQuery(gql(queries.salesLogs), {
    fetchPolicy: 'network-only'
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
