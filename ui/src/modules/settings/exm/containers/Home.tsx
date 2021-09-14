import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import DumbHome from '../components/Home';
import { queries } from '../graphql';

type PropsWithData = {
  lastExmId: string;
};

function HomeWithData(props: PropsWithData) {
  const { data, loading } = useQuery(gql(queries.exmDetail), {
    variables: { _id: props.lastExmId }
  });

  if (loading) {
    return <div>...</div>;
  }

  return <DumbHome exm={data.exmDetail || {}} />;
}

function HomeLastExm() {
  const { data, loading } = useQuery(gql(queries.exmGetLast));

  if (loading) {
    return <div>...</div>;
  }

  if (!data.exmGetLast) {
    return <DumbHome />;
  }

  window.location.href = `/settings/exm?_id=${data.exmGetLast._id}`;

  return null;
}

type Props = {
  queryParams: any;
};

function Home(props: Props) {
  const { queryParams } = props;

  if (!queryParams._id) {
    return <HomeLastExm />;
  }

  return <HomeWithData lastExmId={queryParams._id} />;
}

export default Home;
