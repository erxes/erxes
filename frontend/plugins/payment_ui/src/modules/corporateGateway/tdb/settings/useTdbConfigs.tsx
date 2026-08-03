import { useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { addConfig, configsList, editConfig, removeConfig } from '../configs/graphql';
import { tdbConfigsCountAtom } from '~/modules/corporateGateway/states/gatewayCounts';
import { ITdbConfig } from '../configs/types';

type ListResponse = {
  tdbConfigsList: {
    list: ITdbConfig[];
    totalCount: number;
  };
};

export const useTdbConfigs = () => {
  const setCount = useSetAtom(tdbConfigsCountAtom);

  const { data, loading, refetch } = useQuery<ListResponse>(configsList, {
    variables: { perPage: 50 },
    fetchPolicy: 'network-only',
  });

  const configs = data?.tdbConfigsList?.list ?? [];
  const totalCount = data?.tdbConfigsList?.totalCount ?? 0;

  useEffect(() => {
    if (!loading) {
      setCount(totalCount);
    }
  }, [loading, totalCount, setCount]);

  const [addMutation, { loading: adding }] = useMutation(addConfig, {
    refetchQueries: [{ query: configsList, variables: { perPage: 50 } }],
  });
  const [editMutation, { loading: editing }] = useMutation(editConfig, {
    refetchQueries: [{ query: configsList, variables: { perPage: 50 } }],
  });
  const [removeMutation] = useMutation(removeConfig, {
    refetchQueries: [{ query: configsList, variables: { perPage: 50 } }],
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
