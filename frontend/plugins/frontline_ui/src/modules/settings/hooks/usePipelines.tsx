import { useQuery, QueryHookOptions } from '@apollo/client';
import { IPipeline, ITicketsPipelineFilter } from '@/channels/types';
import { GET_TICKET_PIPELINES } from '@/settings/graphql/queries/getPipelines';

interface IGetPipelinesResponse {
  getTicketPipelines: {
    list: IPipeline[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
      endCursor: string;
    };
    totalCount: number;
  };
}

export const useGetPipelines = (
  options?: QueryHookOptions<IGetPipelinesResponse, ITicketsPipelineFilter>,
) => {
  const { data, loading } = useQuery<
    IGetPipelinesResponse,
    ITicketsPipelineFilter
  >(GET_TICKET_PIPELINES, options);
  return { pipelines: data?.getTicketPipelines?.list, loading };
};
