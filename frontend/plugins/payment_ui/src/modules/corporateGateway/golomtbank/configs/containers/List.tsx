import { useLocation } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';

import { Alert, Spinner } from 'erxes-ui';

import List from './List';
import SidebarList from '../../components/ConfigsList';

import queries from '../graphql/queries';
import mutations from '../graphql/mutations';

type ConfigsListQueryResponse = {
  golomtBankConfigsList: {
    list: any[];
    totalCount: number;
  };
};

type Props = {
  loading?: boolean;
};

export default function ListContainer({ loading: externalLoading }: Props) {
  const location = useLocation();
  const isSettings = location.pathname === '/settings/golomtBank';

  const queryParams = Object.fromEntries(
    new URLSearchParams(location.search).entries(),
  );

  const { data, loading, refetch } = useQuery<ConfigsListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        limit: 20,
        ...queryParams,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [removeMutation] = useMutation(gql(mutations.removeMutation));

  const remove = async (_id: string) => {
    const confirmed = await confirm(
      'Are you sure you want to remove this config?',
    );

    if (!confirmed) return;

    try {
      await removeMutation({ variables: { _id } });
      await refetch();
    } catch (e: any) {
      onerror;
    }
  };

  if (loading || externalLoading) {
    return <Spinner />;
  }

  const configs = data?.golomtBankConfigsList?.list ?? [];
  const totalCount = data?.golomtBankConfigsList?.totalCount ?? 0;

  const sharedProps = {
    loading,
    configs,
    totalCount,
    refetch,
    remove,
    queryParams,
  };

  return isSettings ? (
    <List {...sharedProps} />
  ) : (
    <SidebarList {...sharedProps} />
  );
}
