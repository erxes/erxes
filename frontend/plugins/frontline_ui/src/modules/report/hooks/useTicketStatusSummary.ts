import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_STATUS_SUMMARY } from '@/report/graphql/queries/getTicketChart';

export interface TicketStatusSummaryItem {
  statusType: number;
  name: string;
  color: string;
  count: number;
  percentage: number;
}

interface TicketStatusSummaryResponse {
  reportTicketStatusSummary: TicketStatusSummaryItem[];
}

export const useTicketStatusSummary = (
  options?: QueryHookOptions<TicketStatusSummaryResponse>,
) => {
  const { data, loading, error } = useQuery<TicketStatusSummaryResponse>(
    GET_TICKET_STATUS_SUMMARY,
    options,
  );

  return {
    statusSummary: data?.reportTicketStatusSummary,
    loading,
    error,
  };
};
