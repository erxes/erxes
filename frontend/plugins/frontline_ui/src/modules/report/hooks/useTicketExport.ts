import { useLazyQuery } from '@apollo/client';
import { GET_TICKET_EXPORT } from '@/report/graphql/queries/getTicketChart';

export interface TicketExportItem {
  _id: string;
  name: string;
  state: string;
  priorityLabel: string;
  statusLabel: string;
  assigneeName: string;
  pipelineName: string;
  tagNames: string[];
  createdAt: string;
  startDate?: string;
  targetDate?: string;
  updatedAt?: string;
}

interface TicketExportResponse {
  reportTicketExport: TicketExportItem[];
}

export const useTicketExport = () => {
  const [fetchExport, { loading, error }] = useLazyQuery<TicketExportResponse>(
    GET_TICKET_EXPORT,
    {
      fetchPolicy: 'network-only',
    },
  );

  return { fetchExport, loading, error };
};
