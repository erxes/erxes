import { isRecord } from '@/deals/utils/dealJson';
import {
  MutationFunctionOptions,
  MutationHookOptions,
  QueryHookOptions,
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/client';
import {
  EnumCursorDirection,
  isDefined,
  toast,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  SalesPipelineDetailQuery,
  SalesPipelineDetailQueryVariables,
  SalesPipelinesAddMutation,
  SalesPipelinesAddMutationVariables,
  SalesPipelinesArchiveMutation,
  SalesPipelinesArchiveMutationVariables,
  SalesPipelinesCopiedMutation,
  SalesPipelinesCopiedMutationVariables,
  SalesPipelinesEditMutation,
  SalesPipelinesEditMutationVariables,
  SalesPipelinesQuery,
  SalesPipelinesQueryVariables,
  SalesPipelinesRemoveMutation,
  SalesPipelinesRemoveMutationVariables,
  SalesPipelinesUpdateOrderMutation,
  SalesPipelinesUpdateOrderMutationVariables,
} from '~/gql/graphql';

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

export const usePipelines = (
  options?: QueryHookOptions<SalesPipelinesQuery, SalesPipelinesQueryVariables>,
) => {
  useSubscription(PIPELINE_LIST_CHANGED, {
    skip: options?.skip,
    onData: ({ client, data: result }) => {
      const event = result.data?.salesPipelineListChanged;
      const status =
        isRecord(event?.data) && typeof event.data.status === 'string'
          ? event.data.status
          : undefined;

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

  const { data, loading, error, fetchMore } = useQuery(GET_PIPELINES, {
    ...options,
    variables: options?.variables,
  });

  const {
    list,
    totalCount: rawTotalCount,
    pageInfo,
  } = data?.salesPipelines || {};
  const pipelines = useMemo(() => list?.filter(isDefined), [list]);
  const totalCount = rawTotalCount ?? 0;
  const visiblePipelines = useMemo(
    () =>
      options?.variables?.isAll
        ? pipelines
        : pipelines?.filter(({ status }) => status !== 'archived'),
    [options?.variables?.isAll, pipelines],
  );

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
        if (!fetchMoreResult.salesPipelines) return prev;
        return Object.assign({}, prev, {
          salesPipelines: {
            list: [
              ...(prev.salesPipelines?.list || []),
              ...(fetchMoreResult.salesPipelines?.list ?? []),
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
  options?: MutationHookOptions<
    SalesPipelinesRemoveMutation,
    SalesPipelinesRemoveMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [removePipeline, { loading, error }] = useMutation(REMOVE_PIPELINE, {
    ...options,
    variables: options?.variables,
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

  const mutate = ({
    variables,
    ...options
  }: MutationFunctionOptions<
    SalesPipelinesAddMutation,
    SalesPipelinesAddMutationVariables
  >) => {
    return addPipeline({
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

  const mutate = ({
    variables,
    ...options
  }: MutationFunctionOptions<
    SalesPipelinesEditMutation,
    SalesPipelinesEditMutationVariables
  >) => {
    return editPipeline({
      ...options,
      variables,
      refetchQueries: [
        'SalesPipelines',
        'SalesBoards',
        'salesDealStages',
        'salesDealConversionStages',
        'SalesStages', // Still used by shared selectors and Loyalty.
      ],
      awaitRefetchQueries: true,
      update: (cache, { data }) => {
        const salesPipelinesEdit = data?.salesPipelinesEdit;
        if (salesPipelinesEdit) {
          cache.modify({
            id: cache.identify(salesPipelinesEdit),
            fields: Object.entries(variables || {}).reduce(
              (fields: Record<string, () => unknown>, [field, value]) => {
                fields[field] = () => value;
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
    SalesPipelinesArchiveMutation,
    SalesPipelinesArchiveMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [archivePipeline, { loading, error }] = useMutation(ARCHIVE_PIPELINE, {
    ...options,
    optimisticResponse: {
      salesPipelinesArchive: true,
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
  options?: MutationHookOptions<
    SalesPipelinesCopiedMutation,
    SalesPipelinesCopiedMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [copyPipeline, { loading, error }] = useMutation(COPY_PIPELINE, {
    ...options,
    variables: options?.variables,
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
  options?: MutationHookOptions<
    SalesPipelinesUpdateOrderMutation,
    SalesPipelinesUpdateOrderMutationVariables
  >,
) => {
  const { t } = useTranslation('sales');
  const [updatePipelineOrder, { loading, error }] = useMutation(
    UPDATE_PIPELINE_ORDER,
    {
      ...options,
      variables: options?.variables,
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
  options?: QueryHookOptions<
    SalesPipelineDetailQuery,
    SalesPipelineDetailQueryVariables
  >,
) => {
  const [pipelineIdFromQuery] = useQueryState<string>('pipelineId');

  // Prioritize _id from passed variables, fallback to query state
  const pipelineId = options?.variables?._id || pipelineIdFromQuery;

  const { data, loading, error } = useQuery(GET_PIPELINE_DETAIL, {
    ...options,
    variables: pipelineId ? { _id: pipelineId } : undefined,
    skip: !pipelineId || options?.skip,
  });

  return { pipelineDetail: data?.salesPipelineDetail, loading, error };
};
