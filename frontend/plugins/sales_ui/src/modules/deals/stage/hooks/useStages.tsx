import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import {
  STAGES_EDIT,
  STAGES_REMOVE,
  STAGES_SORT_ITEMS,
  UPDATE_STAGES_ORDER,
} from '@/deals/graphql/mutations/StagesMutations';

import { GET_DEALS } from '@/deals/graphql/queries/DealsQueries';
import { GET_STAGES } from '@/deals/graphql/queries/StagesQueries';
import { IStage } from '@/deals/types/stages';
import { toast } from 'erxes-ui';

export const useStages = (
  options?: QueryHookOptions<{ salesStages: IStage[] }>,
) => {
  const { data, loading, error } = useQuery<{ salesStages: IStage[] }>(
    GET_STAGES,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
    },
  );

  return { stages: data?.salesStages, loading, error };
};

export const useStagesOrder = (options?: MutationHookOptions<any, any>) => {
  const [updateStagesOrder, { loading, error }] = useMutation(
    UPDATE_STAGES_ORDER,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
      refetchQueries: [
        {
          query: GET_STAGES,
          variables: {
            ...options?.variables,
          },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: 'Successfully updated a deal stage',
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message || 'Update failed',
          variant: 'destructive',
        });
      },
    },
  );

  return { updateStagesOrder, loading, error };
};

export function useStagesRemove(options?: MutationHookOptions<any, any>) {
  const [removeStage, { loading, error }] = useMutation(STAGES_REMOVE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_DEALS,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({ title: 'Stage removed', variant: 'default' });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Remove failed',
        variant: 'destructive',
      });
      options?.onError?.(err);
    },
  });

  return { removeStage, loading, error };
}

export function useStagesEdit(options?: MutationHookOptions<any, any>) {
  const [editStage, { loading, error }] = useMutation(STAGES_EDIT, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_DEALS,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({ title: 'Stage updated', variant: 'default' });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Edit failed',
        variant: 'destructive',
      });
      options?.onError?.(err);
    },
  });

  return { editStage, loading, error };
}

export function useStagesSortItems(options?: MutationHookOptions<any, any>) {
  const [sortItems, { loading, error }] = useMutation(STAGES_SORT_ITEMS, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_DEALS,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({ title: 'Items sorted', variant: 'default' });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Sorting failed',
        variant: 'destructive',
      });
      options?.onError?.(err);
    },
  });

  return { sortItems, loading, error };
}
