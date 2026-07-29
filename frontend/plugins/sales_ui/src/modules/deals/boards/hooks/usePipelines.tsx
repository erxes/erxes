import {
  MutationHookOptions,
  QueryHookOptions,
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  toast,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import {
  ADD_PIPELINE,
  ARCHIVE_PIPELINE,
  COPY_PIPELINE,
  EDIT_PIPELINE,
  REMOVE_PIPELINE,
  UPDATE_PIPELINE_ORDER,
} from '@/deals/graphql/mutations/PipelinesMutations';
import {
  GET_PIPELINE_DETAIL,
  GET_PIPELINES,
} from '@/deals/graphql/queries/PipelinesQueries';
import { PIPELINE_LIST_CHANGED } from '@/deals/graphql/subscriptions/pipelineListChange';
import { IPipeline } from '@/deals/types/pipelines';

const PIPELINES_PER_PAGE = 20;

interface IPipelineArchiveData {
  salesPipelinesArchive: boolean;
}

interface IPipelineArchiveVariables {
  _id: string;
}

interface IPipelineListChangedData {
  salesPipelineListChanged: {
    _id: string;
    action: string;
    data: {
      status?: string;
    };
  };
}

export const usePipelines = (
  options?: QueryHookOptions<ICursorListResponse<IPipeline>>,
) => {
  useSubscription<IPipelineListChangedData>(PIPELINE_LIST_CHANGED, {
    skip: options?.skip,
    onData: ({ client, data: result }) => {
      const event = result.data?.salesPipelineListChanged;
      const status = event?.data?.status;

      if (event?.action !== 'statusChanged' || !event._id || !status) {
        return;
      }

      const pipelineCacheId = client.cache.identify({
        __typename: 'SalesPipeline',
        _id: event._id,
      });

      if (pipelineCacheId) {
        client.cache.modify({
          id: pipelineCacheId,
          fields: {
            status: () => status,
          },
        });
      }

      void client
        .refetchQueries({
          include: ['SalesPipelines', 'SalesBoards'],
        })
        .catch((error: unknown) => {
          toast({
            title: error instanceof Error ? error.message : String(error),
            variant: 'destructive',
          });
        });
    },
  });

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
  const visiblePipelines = options?.variables?.isAll
    ? pipelines
    : pipelines?.filter(({ status }) => status !== 'archived');

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

  return {
    pipelines: visiblePipelines,
    loading,
    error,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};

export const usePipelineRemove = (
  options?: MutationHookOptions<{ salesPipelines: IPipeline[] }>,
) => {
  const { t } = useTranslation('sales');
  const [removePipeline, { loading, error }] = useMutation(REMOVE_PIPELINE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: ['SalesPipelines', 'SalesBoards'],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('pipeline-removed'),
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('remove-failed'),
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
      refetchQueries: ['SalesPipelines', 'SalesBoards'],
      awaitRefetchQueries: true,
      update: (cache) => {
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'salesStages' });
        cache.gc();
      },
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
      refetchQueries: ['SalesPipelines', 'SalesBoards', 'SalesStages'],
      awaitRefetchQueries: true,
      update: (cache, { data: { salesPipelinesEdit } }) => {
        if (salesPipelinesEdit) {
          cache.modify({
            id: cache.identify(salesPipelinesEdit),
            fields: Object.keys(variables || {}).reduce(
              (fields: Record<string, () => unknown>, field) => {
                fields[field] = () => variables?.[field];
                return fields;
              },
              {},
            ),
            optimistic: true,
          });
        }
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'salesStages' });
        cache.gc();
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
  options?: MutationHookOptions<
    IPipelineArchiveData,
    IPipelineArchiveVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [archivePipeline, { loading, error }] = useMutation<
    IPipelineArchiveData,
    IPipelineArchiveVariables
  >(ARCHIVE_PIPELINE, {
    ...options,
    optimisticResponse: {
      salesPipelinesArchive: true,
    },
    variables: {
      ...options?.variables,
    },
    update: (cache, _result, { variables }) => {
      if (!variables?._id) return;

      const pipelineCacheId = cache.identify({
        __typename: 'SalesPipeline',
        _id: variables._id,
      });

      if (!pipelineCacheId) return;

      cache.modify({
        id: pipelineCacheId,
        fields: {
          status: (currentStatus: string) =>
            currentStatus === 'active' ? 'archived' : 'active',
        },
      });
    },
    refetchQueries: ['SalesPipelines', 'SalesBoards'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({
        title: t('pipeline-archived'),
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
  const { t } = useTranslation('sales');
  const [copyPipeline, { loading, error }] = useMutation(COPY_PIPELINE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: ['SalesPipelines', 'SalesBoards'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({
        title: t('pipeline-copied'),
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
  const { t } = useTranslation('sales');
  const [updatePipelineOrder, { loading, error }] = useMutation(
    UPDATE_PIPELINE_ORDER,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
      refetchQueries: ['SalesPipelines', 'SalesBoards'],
      awaitRefetchQueries: true,
      onCompleted: () => {
        toast({
          title: t('pipeline-order-updated'),
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

export const usePipelinesBulkRemove = () => {
  const { t } = useTranslation('sales');
  const [_removePipeline, { loading }] = useMutation(REMOVE_PIPELINE);
  const client = useApolloClient();

  const removePipelines = async (pipelines: IPipeline[]) => {
    try {
      const results = await Promise.allSettled(
        pipelines.map((pipeline) =>
          _removePipeline({
            variables: {
              _id: pipeline._id,
            },
            // Don't refetch individually, let bulk operation handle it
            onCompleted: () => {
              toast({
                title: t('pipelines-removed'),
              });
            },
          }),
        ),
      );

      const failures = results.filter((result) => result.status === 'rejected');

      // Some deletions can land even when others fail, so refresh before
      // reporting either outcome — and wait for it, or the caller sees
      // "success" while the table still lists removed pipelines.
      await client.refetchQueries({
        include: ['SalesPipelines', 'SalesBoards'],
      });

      if (failures.length > 0) {
        throw new Error(
          t('failed-to-delete-pipelines', { count: failures.length }),
        );
      }

      toast({
        title: t('success'),
        variant: 'success',
        description: t('pipelines-deleted'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('error'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { removePipelines, loading };
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
