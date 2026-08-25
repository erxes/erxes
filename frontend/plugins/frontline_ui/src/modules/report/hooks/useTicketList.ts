import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_LIST } from '@/report/graphql/queries/getTicketChart';

interface TicketStatusActivity {
  _id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketListItem {
  _id: string;
  name: string;
  statusId: string;
  status?: {
    _id: string;
    name: string;
    color?: string;
    type?: number;
  };
  state?: string;
  priority: number;
  assigneeId: string;
  createdAt: string;
  statusChangedDate?: string;
  targetDate?: string;
  startDate?: string;
  tagIds?: string[];
  pipelineId?: string;
  statusChangeLog?: TicketStatusActivity[];
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

export const useTicketList = (
  options?: QueryHookOptions<TicketListResponse>,
) => {
  const { data, previousData, loading, error } = useQuery<TicketListResponse>(
    GET_TICKET_LIST,
    options,
  );

  return {
    ticketList: data?.reportTicketList ?? previousData?.reportTicketList,
    isFetching: loading,
    isInitialLoad: loading && !previousData,
    error,
  };
};
