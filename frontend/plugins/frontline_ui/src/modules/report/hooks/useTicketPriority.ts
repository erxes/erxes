import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_PRIORITY } from '@/report/graphql/queries/getTicketChart';

export interface TicketPriorityItem {
  priority: number;
  name: string;
  color: string;
  count: number;
  percentage: number;
}

interface TicketPriorityResponse {
  reportTicketPriority: TicketPriorityItem[];
}

export const useTicketPriority = (
  options?: QueryHookOptions<TicketPriorityResponse>,
) => {
  const { data, loading, error } = useQuery<TicketPriorityResponse>(
    GET_TICKET_PRIORITY,
    options,
  );

  return {
    priorityData: data?.reportTicketPriority,
    loading,
    error,
  };
};
