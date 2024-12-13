import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src/components';
import Component from '../components/Header';
import queries from '../graphql/queries';
import { useSearchParams } from 'react-router-dom';

type Props = {
  children?: React.ReactNode;
};


const MainContainer = (props: Props) => {
  const [searchParams] = useSearchParams();



  const configId = searchParams.get('web') || localStorage.getItem('clientPortalId');
  

  const { data: detailData, loading: detailLoading } = useQuery(queries.DETAIL_QUERY, {
    variables: {
      id: configId,
    },
    skip: !configId,
    fetchPolicy: 'network-only',
  });

  const { data, loading } = useQuery(queries.GET_LAST_QUERY, {
    variables: {
      kind: 'client',
    },
    skip: configId ? true : false,
  });

  if (loading || detailLoading) {
    return <Spinner />;
  }

  const config = detailData?.clientPortalGetConfig;
  const lastConfig = data?.clientPortalGetLast;

  
  



  const currentConfig = config || lastConfig;

  if (!currentConfig) {
    return null;
  }

  return <Component currentConfig={currentConfig} />;
};

export default MainContainer;
