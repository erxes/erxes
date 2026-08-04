import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_OPEN } from '@/report/graphql/queries/getTicketChart';

interface TicketMetric {
  count: number;
  percentage: number;
}

interface TicketOpenResponse {
  reportTicketOpen: TicketMetric;
}

export const useTicketOpen = (
  options?: QueryHookOptions<TicketOpenResponse>,
) => {
  const { data, loading, error } = useQuery<TicketOpenResponse>(
    GET_TICKET_OPEN,
    options,
  );

  return {
    ticketOpen: data?.reportTicketOpen,
    loading,
    error,
  };
};
