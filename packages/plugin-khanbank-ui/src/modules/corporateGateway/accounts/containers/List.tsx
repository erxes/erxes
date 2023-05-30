import { router, Spinner } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';

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
  const { data, loading, error } = useQuery<AccountsListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        configId: props.configId,
        ...router.generatePaginationParams(props.queryParams || {})
      },
      fetchPolicy: props.fetchPolicy || 'network-only'
    }
  );

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  const accounts = (data && data.khanbankAccounts) || [];

  const extendedProps = {
    ...props,
    loading,
    accounts,
    configId: props.configId || ''
  };

  return <List {...extendedProps} />;
}
