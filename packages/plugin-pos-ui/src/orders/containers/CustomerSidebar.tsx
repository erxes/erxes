import React from 'react';
import CustomerSidebar from '../components/CustomerSidebar';
import { useQuery, gql } from '@apollo/client';
import { queries as posQueries } from '../../pos/graphql';

const CustomerSection = ({ id }: { id: string }) => {
  const { data, loading } = useQuery(gql(posQueries.posOrdersSummary), {
    variables: {
      customerId: id,
    },
  });

  if (loading) return <div>loading...</div>;

  return <CustomerSidebar {...(data.posOrdersSummary || {})} customerId={id} />;
};

export default CustomerSection;
