import {
  ADD_PIPELINE_LABEL,
  EDIT_PIPELINE_LABEL,
  LABEL_PIPELINE_LABEL,
  REMOVE_PIPELINE_LABEL,
} from '@/deals/graphql/mutations/PipelinesMutations';
import {
  GET_PIPELINE_LABELS,
  GET_PIPELINE_LABEL_DETAIL,
} from '@/deals/graphql/queries/PipelinesQueries';
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
  SalesPipelineLabelDetailQuery,
  SalesPipelineLabelDetailQueryVariables,
  SalesPipelineLabelsAddMutation,
  SalesPipelineLabelsAddMutationVariables,
  SalesPipelineLabelsEditMutation,
  SalesPipelineLabelsEditMutationVariables,
  SalesPipelineLabelsLabelMutation,
  SalesPipelineLabelsLabelMutationVariables,
  SalesPipelineLabelsQuery,
  SalesPipelineLabelsQueryVariables,
  SalesPipelineLabelsRemoveMutation,
  SalesPipelineLabelsRemoveMutationVariables,
} from '~/gql/graphql';

export const usePipelineLabelDetail = (
  options?: QueryHookOptions<
    SalesPipelineLabelDetailQuery,
    SalesPipelineLabelDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_PIPELINE_LABEL_DETAIL, {
    ...options,
    variables: options?.variables,
  });

  return {
    pipelineLabelDetail: data?.salesPipelineLabelDetail,
    loading,
    error,
  };
};

export const usePipelineLabels = (
  options?: QueryHookOptions<
    SalesPipelineLabelsQuery,
    SalesPipelineLabelsQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_PIPELINE_LABELS, {
    ...options,
    variables: options?.variables,
  });

  const pipelineLabels = useMemo(
    () => data?.salesPipelineLabels?.filter(isDefined),
    [data?.salesPipelineLabels],
  );

  return {
    pipelineLabels,
    loading,
    error,
  };
};

export const usePipelineLabelAdd = (
  options?: MutationHookOptions<
    SalesPipelineLabelsAddMutation,
    SalesPipelineLabelsAddMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');

  const [addPipelineLabel, { loading, error }] = useMutation(
    ADD_PIPELINE_LABEL,
    {
      ...options,
      variables: options?.variables,
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: { pipelineId },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: t('label-added'),
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message || t('label-add-failed'),
          variant: 'destructive',
        });
      },
    },
  );

  return {
    addPipelineLabel,
    loading,
    error,
  };
};

export const usePipelineLabelRemove = (
  options?: MutationHookOptions<
    SalesPipelineLabelsRemoveMutation,
    SalesPipelineLabelsRemoveMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');

  const [removePipelineLabel, { loading, error }] = useMutation(
    REMOVE_PIPELINE_LABEL,
    {
      ...options,
      variables: options?.variables,
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: { pipelineId },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: t('label-removed'),
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message || t('label-remove-failed'),
          variant: 'destructive',
        });
      },
    },
  );

  return {
    removePipelineLabel,
    loading,
    error,
  };
};

export const usePipelineLabelEdit = (
  options?: MutationHookOptions<
    SalesPipelineLabelsEditMutation,
    SalesPipelineLabelsEditMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');

  const [editPipelineLabel, { loading, error }] = useMutation(
    EDIT_PIPELINE_LABEL,
    {
      ...options,
      variables: options?.variables,
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: { pipelineId },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: t('label-edited'),
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message || t('label-edit-failed'),
          variant: 'destructive',
        });
      },
    },
  );

  return {
    editPipelineLabel,
    loading,
    error,
  };
};

export const usePipelineLabelLabel = (
  options?: MutationHookOptions<
    SalesPipelineLabelsLabelMutation,
    SalesPipelineLabelsLabelMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState<string>('pipelineId');

  const [labelPipelineLabel, { loading, error }] = useMutation(
    LABEL_PIPELINE_LABEL,
    {
      ...options,
      variables: options?.variables,
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: { pipelineId },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: t('deal-labeled'),
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message || t('deal-label-failed'),
          variant: 'destructive',
        });
      },
    },
  );

  return {
    labelPipelineLabel,
    loading,
    error,
  };
};
