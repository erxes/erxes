import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_TAGS } from '@/report/graphql/queries/getTicketChart';

interface TicketTag {
  _id: string;
  name: string;
  count: number;
  percentage: number;
  colorCode?: string;
}

interface TicketTagsResponse {
  reportTicketTags: TicketTag[];
}

export const useTicketTags = (
  options?: QueryHookOptions<TicketTagsResponse>,
) => {
  const { data, loading, error } = useQuery<TicketTagsResponse>(
    GET_TICKET_TAGS,
    options,
  );

  return {
    ticketTags: data?.reportTicketTags,
    loading,
    error,
  };
};
