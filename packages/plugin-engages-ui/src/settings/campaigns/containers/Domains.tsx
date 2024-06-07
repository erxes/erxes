import React from 'react';
import {
  mutations as engageMutations,
  queries as engageQueries,
} from '@erxes/ui-engage/src/graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

import { gql, useQuery } from '@apollo/client';
import Component from '../components/Domains';


const Domains = () => {
  const { data, loading } = useQuery(gql(engageQueries.domains));

  if (loading) {
    return <Spinner objective={true}/>;
  }

  return <Component domains={data?.engageSocketLabsDomains || []} />;
};

export default Domains;
