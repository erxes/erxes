import {
  ADD_PIPELINE,
  ARCHIVE_PIPELINE,
  COPY_PIPELINE,
  EDIT_PIPELINE,
  REMOVE_PIPELINE,
  UPDATE_PIPELINE_ORDER,
} from '@/deals/graphql/mutations/PipelinesMutations';
import {
  EnumCursorDirection,
  ICursorListResponse,
  toast,
  useQueryState,
  useToast,
} from 'erxes-ui';
import {
  GET_PIPELINES,
  GET_PIPELINE_DETAIL,
} from '@/deals/graphql/queries/PipelinesQueries';
import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';

import { IPipeline } from '@/deals/types/pipelines';

const PIPELINES_PER_PAGE = 20;

export const usePipelines = (
  options?: QueryHookOptions<ICursorListResponse<IPipeline>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IPipeline>
  >(GET_PIPELINES, {
    ...options,
    variables: {
      ...options?.variables,
    },
  });

  const {
    list: pipelines,
    totalCount = 0,
    pageInfo,
  } = data?.salesPipelines || {};

  const handleFetchMore = () => {
    if (totalCount <= (pipelines?.length || 0)) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: PIPELINES_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          salesPipelines: {
            list: [
              ...(prev.salesPipelines?.list || []),
              ...fetchMoreResult.salesPipelines.list,
            ],
            totalCount: fetchMoreResult.salesPipelines.totalCount,
            pageInfo: fetchMoreResult.salesPipelines.pageInfo,
          },
        });
      },
    });
  };

  return { pipelines, loading, error, handleFetchMore, pageInfo, totalCount };
};

export const usePipelineRemove = (
  options?: MutationHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const [removePipeline, { loading, error }] = useMutation(REMOVE_PIPELINE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: ['SalesPipelines'],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully removed a pipeline',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Remove failed',
        variant: 'destructive',
      });
    },
  });

  return {
    removePipeline,
    loading,
    error,
  };
};

export const usePipelineAdd = () => {
  const [addPipeline, { loading, error }] = useMutation(ADD_PIPELINE);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addPipeline({
      ...options,
      variables,
      refetchQueries: ['SalesPipelines'],
      awaitRefetchQueries: true,
      onError: (error) => {
        toast({
          title: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return {
    addPipeline: mutate,
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
      refetchQueries: ['SalesPipelines', 'SalesStages'],
      awaitRefetchQueries: true,
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
    refetchQueries: ['SalesPipelines'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({
        title: 'Pipeline archived successfully',
      });
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: 'destructive',
      });
    },
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
    refetchQueries: ['SalesPipelines'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({
        title: 'Pipeline copied successfully',
      });
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: 'destructive',
      });
    },
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
      refetchQueries: ['SalesPipelines'],
      awaitRefetchQueries: true,
      onCompleted: () => {
        toast({
          title: 'Pipeline order updated successfully',
        });
      },
      onError: (error) => {
        toast({
          title: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  return {
    updatePipelineOrder,
    loading,
    error,
  };
};

export const usePipelineDetail = (
  options?: QueryHookOptions<{ salesPipelineDetail: IPipeline }>,
) => {
  const [pipelineIdFromQuery] = useQueryState('pipelineId');

  // Prioritize _id from passed variables, fallback to query state
  const pipelineId = options?.variables?._id || pipelineIdFromQuery;

  const { data, loading, error } = useQuery<{ salesPipelineDetail: IPipeline }>(
    GET_PIPELINE_DETAIL,
    {
      ...options,
      variables: {
        ...options?.variables,
        _id: pipelineId,
      },
      skip: !pipelineId,
    },
  );

  return { pipelineDetail: data?.salesPipelineDetail, loading, error };
};
