import {
  EnumCursorDirection,
  ICursorListResponse,
  useQueryState,
} from 'erxes-ui';
import { GET_PIPELINES, GET_PIPELINE_DETAIL } from '../graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';

import { IPipeline } from '../types';

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

export const usePipelineDetail = (
  options?: QueryHookOptions<{ salesPipelineDetail: IPipeline }>,
) => {
  const [pipelineIdFromQuery] = useQueryState('pipelineId');

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
