import { useQueryState } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_PIPELINE_DETAIL } from '../graphql/queries/pipeLineQueries';
import { IPipeline } from '../types/Pipeline';

export const usePipelineDetail = (
  options?: QueryHookOptions<{ salesPipelineDetail: IPipeline }>,
) => {
  const [pipelineIdFromQuery] = useQueryState('pipelineId');

  const pipelineId = options?.variables?._id || pipelineIdFromQuery;

  const { data, loading, error } = useQuery<{
    salesPipelineDetail: IPipeline;
  }>(GET_PIPELINE_DETAIL, {
    ...options,
    variables: {
      ...options?.variables,
      _id: pipelineId,
    },
    skip: !pipelineId,
  });

  return { pipelineDetail: data?.salesPipelineDetail, loading, error };
};
