import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src/components';
import Component from '../components/Header';

type Props = {
  children?: React.ReactNode;
};

const GET_LAST_QUERY = gql`
  query clientPortalGetLast($kind: BusinessPortalKind) {
    clientPortalGetLast(kind: $kind) {
      _id
      name
      domain
      url
    }
  }
`;

const DETAIL_QUERY = gql`
  query ClientPortalGetConfig($id: String!) {
    clientPortalGetConfig(_id: $id) {
      _id
      name
      domain
      url
    }
  }
`;

const MainContainer = (props: Props) => {
  const storedId = localStorage.getItem('clientPortalId');

  const { data: detailData, loading: detailLoading } = useQuery(DETAIL_QUERY, {
    variables: {
      id: storedId,
    },
    skip: !storedId,
  });

  const { data, loading } = useQuery(GET_LAST_QUERY, {
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
