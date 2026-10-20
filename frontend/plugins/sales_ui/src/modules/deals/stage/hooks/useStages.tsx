import {
  STAGES_EDIT,
  STAGES_REMOVE,
  STAGES_SORT_ITEMS,
  UPDATE_STAGES_ORDER,
} from '@/deals/graphql/mutations/StagesMutations';
import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { isDefined, toast, useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  SalesDealStagesQuery,
  SalesDealStagesQueryVariables,
  SalesStageDetailQuery,
  SalesStageDetailQueryVariables,
  SalesStagesEditMutation,
  SalesStagesEditMutationVariables,
  SalesStagesRemoveMutation,
  SalesStagesRemoveMutationVariables,
  SalesStagesSortItemsMutation,
  SalesStagesSortItemsMutationVariables,
  SalesStagesUpdateOrderMutation,
  SalesStagesUpdateOrderMutationVariables,
} from '~/gql/graphql';

import { GET_DEALS } from '@/deals/graphql/queries/DealsQueries';
import {
  GET_STAGE_DETAIL,
  GET_STAGES,
} from '@/deals/graphql/queries/StagesQueries';

export const useStages = (
  options?: QueryHookOptions<
    SalesDealStagesQuery,
    SalesDealStagesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_STAGES, {
    ...options,
    variables: options?.variables,
  });

  const stages = useMemo(
    () => data?.salesStages?.filter(isDefined) ?? [],
    [data?.salesStages],
  );

  return { stages, loading, error };
};

export const useStagesOrder = (
  options?: MutationHookOptions<
    SalesStagesUpdateOrderMutation,
    SalesStagesUpdateOrderMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [updateStagesOrder, { loading, error }] = useMutation(
    UPDATE_STAGES_ORDER,
    {
      ...options,
      variables: options?.variables,
      refetchQueries: [
        {
          query: GET_STAGES,
          variables: options?.variables,
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: t('successfully-updated-deal-stage'),
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message || t('update-failed'),
          variant: 'destructive',
        });
      },
    },
  );

  return { updateStagesOrder, loading, error };
};

export function useStagesRemove(
  options?: MutationHookOptions<
    SalesStagesRemoveMutation,
    SalesStagesRemoveMutationVariables
  >,
) {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');

  const [removeStage, { loading, error }] = useMutation(STAGES_REMOVE, {
    ...options,
    variables: options?.variables,
    refetchQueries: [
      {
        query: GET_STAGES,
        variables: {
          pipelineId,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({ title: t('stage-removed'), variant: 'default' });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('remove-failed'),
        variant: 'destructive',
      });
      options?.onError?.(err);
    },
  });

  return { removeStage, loading, error };
}

export function useStagesEdit(
  options?: MutationHookOptions<
    SalesStagesEditMutation,
    SalesStagesEditMutationVariables
  >,
) {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');

  const [editStage, { loading, error }] = useMutation(STAGES_EDIT, {
    ...options,
    variables: options?.variables,
    refetchQueries: [
      {
        query: GET_STAGES,
        variables: {
          pipelineId,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({ title: t('stage-updated'), variant: 'default' });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('edit-failed'),
        variant: 'destructive',
      });
      options?.onError?.(err);
    },
  });

  return { editStage, loading, error };
}

export function useStagesSortItems(
  options?: MutationHookOptions<
    SalesStagesSortItemsMutation,
    SalesStagesSortItemsMutationVariables
  >,
) {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');
  const [sortItemsBase, { loading, error }] = useMutation(STAGES_SORT_ITEMS, {
    ...options,
    variables: options?.variables,
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({ title: t('items-sorted'), variant: 'default' });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('sorting-failed'),
        variant: 'destructive',
      });
      options?.onError?.(err);
    },
  });

  const sortItems = (stageId: string, sortType: string) =>
    sortItemsBase({
      variables: { stageId, sortType },
      refetchQueries: [
        { query: GET_DEALS, variables: { stageId, pipelineId } },
      ],
    });

  return { sortItems, loading, error };
}

export const useStageDetail = (
  options?: QueryHookOptions<
    SalesStageDetailQuery,
    SalesStageDetailQueryVariables
  >,
) => {
  const [stageIdFromQuery] = useQueryState<string>('stageId');
  const stageId = options?.variables?._id || stageIdFromQuery;

  const { data, loading, error } = useQuery(GET_STAGE_DETAIL, {
    ...options,
    variables: stageId ? { _id: stageId } : undefined,
    skip: !stageId,
  });

  return { stageDetail: data?.salesStageDetail, loading, error };
};
