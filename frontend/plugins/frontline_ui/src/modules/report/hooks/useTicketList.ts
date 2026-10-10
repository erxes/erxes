import {
  ApolloError,
  QueryHookOptions,
  useQuery,
  useSubscription,
} from '@apollo/client';
import { TICKET_LIST_CHANGED } from '@/ticket/graphql/subscriptions/ticketListChanged';
import { GET_TICKET_LIST } from '@/report/graphql/queries/getTicketChart';

export interface TicketListItem {
  _id: string;
  name: string;
  number?: string;
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
  description?: string;
  updatedAt?: string;
  statusChangedDate?: string;
  statusChangedBy?: string;
  updatedBy?: string;
  targetDate?: string;
  startDate?: string;
  tagIds?: string[];
  pipelineId?: string;
  channelId?: string;
  branchId?: string;
  departmentId?: string;
  createdBy?: string;
  propertiesData?: Record<string, unknown>;
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

interface UseTicketListResult {
  ticketList?: TicketListResult;
  isFetching: boolean;
  isInitialLoad: boolean;
  error?: ApolloError;
}

export const useTicketList = (
  options?: QueryHookOptions<TicketListResponse>,
): UseTicketListResult => {
  const { data, previousData, loading, error, refetch } =
    useQuery<TicketListResponse>(GET_TICKET_LIST, {
      ...options,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    });

  useSubscription(TICKET_LIST_CHANGED, {
    skip: options?.skip,
    onData: () => {
      void refetch();
    },
  });

  return {
    ticketList: data?.reportTicketList ?? previousData?.reportTicketList,
    isFetching: loading,
    isInitialLoad: loading && !previousData,
    error,
  };
};
