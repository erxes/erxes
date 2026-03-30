import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_TOTAL_COUNT } from '@/report/graphql/queries/getTicketChart';

interface TicketTotalCountResponse {
  reportTicketTotalCount: number;
}

export const useTicketTotalCount = (
  options?: QueryHookOptions<TicketTotalCountResponse>,
) => {
  const { data, loading, error } = useQuery<TicketTotalCountResponse>(
    GET_TICKET_TOTAL_COUNT,
    options,
  );

  return {
    totalCount: data?.reportTicketTotalCount ?? 0,
    loading,
    error,
  };
};
