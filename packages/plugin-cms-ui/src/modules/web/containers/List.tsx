import React from 'react';
import Component from '../components/List';
import { gql, useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {};

const LIST_QUERY = gql`
  query clientPortalGetConfigs($searchValue: String) {
    clientPortalGetConfigs(search: $searchValue) {
      _id
      name
      description
      domain
      createdAt
      kind
      url
    }
  }
`;

const List = (props: Props) => {
  const { data, loading, refetch } = useQuery(LIST_QUERY);

  if (loading) {
    return <Spinner />;
  }

  const websites = data?.clientPortalGetConfigs || [];
  //   return <div>hi</div>
  return <Component websites={websites} />;
};

export default List;
