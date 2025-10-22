import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import { ITicketStatus } from '@/status/types';
import { useParams } from 'react-router';

interface IUseGetTicketStatusByTypeResponse {
  getTicketStatusesByType: ITicketStatus[];
  loading: boolean;
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
    },
  );

  const statuses = data?.getTicketStatusesByType;

  return { statuses, loading, error };
};
