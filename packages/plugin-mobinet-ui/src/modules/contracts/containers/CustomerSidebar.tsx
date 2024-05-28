import Spinner from '@erxes/ui/src/components/Spinner';
import { gql, useQuery } from '@apollo/client';
import React from 'react';

import CustomerSidebar from '../components/CustomerSidebar';

import { queries } from '../graphql';

type Props = {
  id: string;
};

const CustomerSidebarContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.list), {
    variables: { customerId: props.id },
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  const contracts = (data && data.mobiContracts) || [];

  const updatedProps = {
    contracts
  };

  return <CustomerSidebar {...updatedProps} />;
};

export default CustomerSidebarContainer;
