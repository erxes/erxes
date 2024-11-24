import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src/components';
import Component from '../components/Header';
import queries from '../graphql/queries';

type Props = {
  children?: React.ReactNode;
};


const MainContainer = (props: Props) => {
  const storedId = localStorage.getItem('clientPortalId');

  const { data: detailData, loading: detailLoading } = useQuery(queries.DETAIL_QUERY, {
    variables: {
      id: storedId,
    },
    skip: !storedId,
  });

  const { data, loading } = useQuery(queries.GET_LAST_QUERY, {
    variables: {
      kind: 'client',
    },
  });

  if (loading || detailLoading) {
    return <Spinner />;
  }

  const currentConfig = detailData
    ? detailData.clientPortalGetConfig
    : data?.clientPortalGetLast;

  if (!currentConfig) {
    return null;
  }

  return <Component currentConfig={data?.clientPortalGetLast} />;
};

export default MainContainer;
