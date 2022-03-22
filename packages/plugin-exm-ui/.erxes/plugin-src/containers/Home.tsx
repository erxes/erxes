import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import Spinner from '@erxes/ui/src/components/Spinner';

import DumbHome from '../components/Home';
import { queries } from '../graphql';

function Home() {
  const { data, loading, error } = useQuery(gql(queries.exmGet));

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  return <DumbHome exm={data.exmGet} />;
}

export default Home;
