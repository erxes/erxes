import {
  ADD_PIPELINE,
  ARCHIVE_PIPELINE,
  COPY_PIPELINE,
  EDIT_PIPELINE,
  REMOVE_PIPELINE,
  UPDATE_PIPELINE_ORDER,
} from '@/deals/graphql/mutations/PipelinesMutations';
import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { useQueryState, useToast } from 'erxes-ui';

import { GET_PIPELINES } from '@/deals/graphql/queries/PipelinesQueries';
import { IPipeline } from '@/deals/types/pipelines';

// const PIPELINES_PER_PAGE = 20;

export const usePipelines = (
  options?: QueryHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const [boardId] = useQueryState('activeBoardId');

  const { data, loading, error } = useQuery<{ salesPipelines: IPipeline[] }>(
    GET_PIPELINES,
    {
      ...options,
      variables: {
        ...options?.variables,
        boardId,
        isAll: true,
      },
    },
  );

  // const handleFetchMore = () => {
  //   if (totalCount <= (salesPipelines?.length || 0)) return;
  //   fetchMore({
  //     variables: {
  //       ...options?.variables,
  //       cursor: pageInfo?.endCursor,
  //       limit: PIPELINES_PER_PAGE,
  //       direction: EnumCursorDirection.FORWARD,
  //     },
  //     updateQuery: (prev, { fetchMoreResult }) => {
  //       if (!fetchMoreResult) return prev;
  //       return Object.assign({}, prev, {
  //         salesPipelines: {
  //           list: [...(prev.salesPipelines || []), ...fetchMoreResult.salesPipelines],
  //         },
  //       });
  //     },
  //   });
  // };

  return { pipelines: data?.salesPipelines, loading, error };
};

export const usePipelineRemove = (
  options?: MutationHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const [removePipeline, { loading, error }] = useMutation(REMOVE_PIPELINE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_PIPELINES,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    removePipeline,
    loading,
    error,
  };
};

export const usePipelineAdd = (
  options?: MutationHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const [addPipeline, { loading, error }] = useMutation(ADD_PIPELINE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_PIPELINES,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    addPipeline,
    loading,
    error,
  };
};

export const usePipelineEdit = () => {
  const [editPipeline, { loading, error }] = useMutation(EDIT_PIPELINE);
  const { toast } = useToast();

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editPipeline({
      ...options,
      variables,
      update: (cache, { data: { salesPipelinesEdit } }) => {
        if (!salesPipelinesEdit) return;
        cache.modify({
          id: cache.identify(salesPipelinesEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => (variables || {})[field];
              return fields;
            },
            {},
          ),
          optimistic: true,
        });
      },
      onCompleted: (data) => {
        if (data?.salesPipelinesEdit) {
          toast({ title: 'Pipeline updated successfully!' });
        }
      },
      onError: (error) => {
        toast({
          title: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { pipelineEdit: mutate, loading, error };
};

export const usePipelineArchive = (
  options?: MutationHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const [archivePipeline, { loading, error }] = useMutation(ARCHIVE_PIPELINE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_PIPELINES,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    archivePipeline,
    loading,
    error,
  };
};

export const usePipelineCopy = (
  options?: MutationHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const [copyPipeline, { loading, error }] = useMutation(COPY_PIPELINE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_PIPELINES,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    copyPipeline,
    loading,
    error,
  };
};

export const usePipelineUpdateOrder = (
  options?: MutationHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const [updatePipelineOrder, { loading, error }] = useMutation(
    UPDATE_PIPELINE_ORDER,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
      refetchQueries: [
        {
          query: GET_PIPELINES,
          variables: {
            ...options?.variables,
          },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  return {
    updatePipelineOrder,
    loading,
    error,
  };
};
