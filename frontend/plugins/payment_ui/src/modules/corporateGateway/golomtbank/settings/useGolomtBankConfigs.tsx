import { useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import queries from '../graphql/queries';
import mutations from '../graphql/mutations';
import { golomtConfigsCountAtom } from '~/modules/corporateGateway/states/gatewayCounts';
import { IGolomtBankConfigsItem } from '../types/IConfigs';

type ListResponse = {
  golomtBankConfigsList: {
    list: IGolomtBankConfigsItem[];
    totalCount: number;
  };
};

const LIST_QUERY = gql(queries.listQuery);

export const useGolomtBankConfigs = () => {
  const setCount = useSetAtom(golomtConfigsCountAtom);

  const { data, loading, refetch } = useQuery<ListResponse>(LIST_QUERY, {
    variables: { perPage: 50 },
    fetchPolicy: 'network-only',
  });

  const configs = data?.golomtBankConfigsList?.list ?? [];
  const totalCount = data?.golomtBankConfigsList?.totalCount ?? 0;

  useEffect(() => {
    if (!loading) {
      setCount(totalCount);
    }
  }, [loading, totalCount, setCount]);

  const [addMutation, { loading: adding }] = useMutation(
    gql(mutations.addMutation),
    { refetchQueries: [{ query: LIST_QUERY, variables: { perPage: 50 } }] },
  );
  const [editMutation, { loading: editing }] = useMutation(
    gql(mutations.editMutation),
    { refetchQueries: [{ query: LIST_QUERY, variables: { perPage: 50 } }] },
  );
  const [removeMutation] = useMutation(gql(mutations.removeMutation), {
    refetchQueries: [{ query: LIST_QUERY, variables: { perPage: 50 } }],
  });

  return {
    configs,
    totalCount,
    loading,
    saving: adding || editing,
    addConfig: (variables: Record<string, any>) =>
      addMutation({ variables }),
    editConfig: (variables: Record<string, any>) =>
      editMutation({ variables }),
    removeConfig: (_id: string) => removeMutation({ variables: { _id } }),
    refetch,
  };
};
