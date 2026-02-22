import { gql, useQuery } from '@apollo/client';

import List from '../components/List';
import queries from '../graphql/queries';
import { AccountsListQueryResponse } from '../types';

type Props = {
  configId?: string;
  queryParams: any;
  fetchPolicy?: any;
};

export default function ListContainer({
  configId,
  queryParams,
  fetchPolicy = 'network-only',
}: Props) {
  const { data, loading, error } =
    useQuery<AccountsListQueryResponse>(
      gql(queries.listQuery),
      {
        variables: {
          configId,
        },
        fetchPolicy,
      },
    );

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="text-sm text-muted-foreground">
          Loading accounts...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
        {error.message}
      </div>
    );
  }

  const accounts = data?.khanbankAccounts ?? [];

  return (
    <List
      accounts={accounts}
      configId={configId || ''}
      queryParams={queryParams}
    />
  );
}