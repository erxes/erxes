import { ADD_PIPELINE_LABEL, EDIT_PIPELINE_LABEL, LABEL_PIPELINE_LABEL, REMOVE_PIPELINE_LABEL } from "@/deals/graphql/mutations/PipelinesMutations";
import { GET_PIPELINE_LABELS, GET_PIPELINE_LABEL_DETAIL } from "@/deals/graphql/queries/PipelinesQueries";
import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from "@apollo/client";
import { toast, useQueryState } from "erxes-ui";
import { useTranslation } from "react-i18next";

import { IPipelineLabel } from "@/deals/types/pipelines";

export const usePipelineLabelDetail = (
    options?: QueryHookOptions<{ salesPipelineLabelDetail: IPipelineLabel }>,
  ) => {  
    const { data, loading, error } = useQuery<{ salesPipelineLabelDetail: IPipelineLabel }>(
      GET_PIPELINE_LABEL_DETAIL,
      {
        ...options,
        variables: {
          ...options?.variables,
        },
      },
    );
  
    return { pipelineLabelDetail: data?.salesPipelineLabelDetail, loading, error };
  };

export const usePipelineLabels = (
    options?: QueryHookOptions<{ salesPipelineLabels: IPipelineLabel[] }>,
  ) => {
    const { data, loading, error } = useQuery<{ salesPipelineLabels: IPipelineLabel[] }>(
      GET_PIPELINE_LABELS,
      {
        ...options,
        variables: {
          ...options?.variables,
        },
      },
    );
    
    return { pipelineLabels: data?.salesPipelineLabels, loading, error };
}

export const usePipelineLabelAdd = (options?: MutationHookOptions<any, any>) => {
  const { t } = useTranslation('sales');
  const [pipelineId] = useQueryState('pipelineId');

    const [addPipelineLabel, { loading, error }] = useMutation(ADD_PIPELINE_LABEL, {
      ...options,
      variables: {
        ...options?.variables,
        pipelineId,
      },
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: {
            ...options?.variables,
            pipelineId,
          },
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
    });

    return {
      addPipelineLabel,
      loading,
      error,
    };
  }

  export const usePipelineLabelRemove = (options?: MutationHookOptions<any, any>) => {
    const { t } = useTranslation('sales');
    const [pipelineId] = useQueryState('pipelineId');

    const [removePipelineLabel, { loading, error }] = useMutation(REMOVE_PIPELINE_LABEL, {
      ...options,
      variables: {
        ...options?.variables,
        pipelineId,
      },
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: {
            ...options?.variables,
            pipelineId,
          },
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
    });

    return {
      removePipelineLabel,
      loading,
      error,
    };
  }

  export const usePipelineLabelEdit = (options?: MutationHookOptions<any, any>) => {
    const { t } = useTranslation('sales');
    const [pipelineId] = useQueryState('pipelineId');

    const [editPipelineLabel, { loading, error }] = useMutation(EDIT_PIPELINE_LABEL, {
      ...options,
      variables: {
        ...options?.variables,
        pipelineId,
      },
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: {
            ...options?.variables,
            pipelineId,
          },
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
    });

    return {
      editPipelineLabel,
      loading,
      error,
    };
  }

  export const usePipelineLabelLabel = (options?: MutationHookOptions<any, any>) => {
    const { t } = useTranslation('sales');
    const [pipelineId] = useQueryState('pipelineId');

    const [labelPipelineLabel, { loading, error }] = useMutation(LABEL_PIPELINE_LABEL, {
      ...options,
      variables: {
        ...options?.variables,
      },
      refetchQueries: [
        {
          query: GET_PIPELINE_LABELS,
          variables: {
            ...options?.variables,
            pipelineId,
          },
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
    });

    return {
      labelPipelineLabel,
      loading,
      error,
    };
  }
