import { ADD_PIPELINE_LABEL, EDIT_PIPELINE_LABEL, LABEL_PIPELINE_LABEL, REMOVE_PIPELINE_LABEL } from "@/deals/graphql/mutations/PipelinesMutations";
import { GET_PIPELINE_LABELS, GET_PIPELINE_LABEL_DETAIL } from "@/deals/graphql/queries/PipelinesQueries";
import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from "@apollo/client";
import { toast, useQueryState } from "erxes-ui";

import { GET_DEAL_DETAIL } from "@/deals/graphql/queries/DealsQueries";
import { IPipelineLabel } from "@/deals/types/pipelines";
import { dealDetailSheetState } from "@/deals/states/dealDetailSheetState";
import { useAtom } from "jotai";

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
          title: 'Successfully added a label',
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message || 'Label add failed',
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
          title: 'Successfully removed a label',
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message || 'Label remove failed',
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
          title: 'Successfully edited a label',
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message || 'Label edit failed',
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
    const [pipelineId] = useQueryState('pipelineId');
    const [_id] = useAtom(dealDetailSheetState);

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
        {
          query: GET_DEAL_DETAIL,
          variables: {
            ...options?.variables,
            _id,
          },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: 'Successfully labeled a deal',
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message || 'Label label failed',
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
