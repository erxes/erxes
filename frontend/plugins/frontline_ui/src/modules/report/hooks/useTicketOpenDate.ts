import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_DATE } from '@/report/graphql/queries/getTicketChart';

interface TicketDateStat {
  date: string;
  count: number;
}

interface TicketDateResponse {
  reportTicketDate: TicketDateStat[];
}

export const useTicketDate = (
  options?: QueryHookOptions<TicketDateResponse>,
) => {
  const { data, loading, error } = useQuery<TicketDateResponse>(
    GET_TICKET_DATE,
    options,
  );

  return {
    ticketDate: data?.reportTicketDate,
    loading,
    error,
  };
};
