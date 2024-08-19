import React from 'react';
import CustomerSidebar from '../components/CustomerSidebar';
import { useQuery, gql } from '@apollo/client';
import { queries } from '../graphql';

const CustomerSection = ({ id }: { id: string }) => {
  const { data, loading } = useQuery(gql(queries.msdCustomerRelations), {
    variables: {
      customerId: id,
    },
  });

  return (
    <CustomerSidebar
      loading={loading}
      relations={data?.msdCustomerRelations || []}
    />
  );
};

export default CustomerSection;
