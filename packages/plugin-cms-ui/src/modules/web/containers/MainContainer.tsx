import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src/components';
import Component from '../components/MainContainer';

type Props = {};

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

const MainContainer = (props: Props) => {
    console.log("aaaa")
  const { data, loading } = useQuery(GET_LAST_QUERY, {
    variables: {
      kind: 'client',
    },
  });



  if (loading) {
    return <Spinner />;
  }

  const currentConfig = data?.clientPortalGetLast;


  if (!currentConfig) {
    return null;
  }

  return <Component currentConfig={data?.clientPortalGetLast} />;
};

export default MainContainer;
