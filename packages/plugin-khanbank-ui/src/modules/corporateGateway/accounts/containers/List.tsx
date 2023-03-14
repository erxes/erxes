import { router } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import List from '../components/List';
import queries from '../graphql/queries';
import { AccountsListQueryResponse } from '../types';

type Props = {
  refetch?: () => void;
  history?: any;
  configId?: string;
  queryParams: any;
  fetchPolicy?: any;
} & IRouterProps;

export default function ListContainer(props: Props) {
  const { data, loading } = useQuery<AccountsListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        configId: props.configId,
        ...router.generatePaginationParams(props.queryParams || {})
      },
      fetchPolicy: props.fetchPolicy || 'network-only'
    }
  );

  const accounts = (data && data.khanbankAccounts) || [];

  const extendedProps = {
    ...props,
    loading,
    accounts,
    configId: props.configId || ''
  };

  return <List {...extendedProps} />;
}
