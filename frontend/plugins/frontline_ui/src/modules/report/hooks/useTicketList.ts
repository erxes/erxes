import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_LIST } from '@/report/graphql/queries/getTicketChart';

export interface TicketListItem {
  _id: string;
  name: string;
  statusId: string;
  state?: string;
  priority: number;
  assigneeId: string;
  createdAt: string;
  targetDate?: string;
  startDate?: string;
  tagIds?: string[];
  pipelineId?: string;
}

interface TicketListResult {
  list: TicketListItem[];
  totalCount: number;
  page: number;
  totalPages: number;
}

interface TicketListResponse {
  reportTicketList: TicketListResult;
}

export const useTicketList = (options?: QueryHookOptions<TicketListResponse>) => {
  const { data, loading, error } = useQuery<TicketListResponse>(GET_TICKET_LIST, options);

  return {
    ticketList: data?.reportTicketList,
    loading,
    error,
  };
};
