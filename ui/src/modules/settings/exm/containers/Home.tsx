import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import ErrorMsg from 'modules/common/components/ErrorMsg';
import Spinner from 'modules/common/components/Spinner';

import DumbHome from '../components/Home';
import { queries } from '../graphql';

function Home() {
  const { data, loading, error } = useQuery(gql(queries.exmGetLast));

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  return <DumbHome exm={data.exmGetLast} />;
}

export default Home;
