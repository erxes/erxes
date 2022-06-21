import React from 'react';
import gql from 'graphql-tag';
import SalesPlans from '../components/SalesPlans';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';

function SalesPlansContainer() {
  const a = useQuery(gql(queries.getSalesLogs), {
    fetchPolicy: 'network-only'
  });

  return (
    <SalesPlans
      listData={a.data ? a.data.getSalesLogs : []}
      refetch={a.refetch}
    />
  );
}
export default SalesPlansContainer;
