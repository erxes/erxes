import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import { ITicketStatus, ITicketStatusChoice } from '@/status/types';
import { useParams } from 'react-router';
import { GET_TICKET_STATUS_BY_PIPELINE } from '@/status/graphql/query/getTicketStatusesByPipelines';

interface IUseGetTicketStatusByTypeResponse {
  getTicketStatusesByType: ITicketStatus[];
}

export const useGetTicketStatus = (options?: QueryHookOptions) => {
  const { pipelineId } = useParams();
  const { data, loading, error } = useQuery<IUseGetTicketStatusByTypeResponse>(
    GET_TICKET_STATUS_BY_TYPE,
    {
      ...options,
      variables: {
        pipelineId,
        ...options?.variables,
      },
      skip: !pipelineId,
    },
  );

  const statuses = data?.getTicketStatusesByType;

  return { statuses, loading, error };
};

interface IUseGetTicketStatusByPipelineResponse {
  getTicketStatusesChoicesPipeline: ITicketStatusChoice[];
}

export const useGetTicketStatusesByPipeline = (options?: QueryHookOptions) => {
  const { pipelineId } = useParams();
  const { data, loading, error } =
    useQuery<IUseGetTicketStatusByPipelineResponse>(
      GET_TICKET_STATUS_BY_PIPELINE,
      {
        ...options,
        variables: {
          pipelineId,
          ...options?.variables,
        },
        skip: !pipelineId,
      },
    );

  const statuses = data?.getTicketStatusesChoicesPipeline;

  return { statuses, loading, error };
};
