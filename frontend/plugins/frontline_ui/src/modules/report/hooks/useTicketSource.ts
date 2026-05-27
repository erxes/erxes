import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_SOURCE } from '@/report/graphql/queries/getTicketChart';

interface TicketSource {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}

interface TicketSourceResponse {
  reportTicketSource: TicketSource[];
}

export const useTicketSource = (
  options?: QueryHookOptions<TicketSourceResponse>,
) => {
  const { data, loading, error } = useQuery<TicketSourceResponse>(
    GET_TICKET_SOURCE,
    options,
  );

  return {
    ticketSources: data?.reportTicketSource,
    loading,
    error,
  };
};
