import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_CUSTOM_PROPERTIES } from '@/report/graphql/queries/getTicketChart';

interface TicketCustomProperty {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}

interface TicketCustomPropertiesResponse {
  reportTicketCustomProperties: TicketCustomProperty[];
}

export const useTicketCustomProperties = (
  options?: QueryHookOptions<TicketCustomPropertiesResponse>,
) => {
  const { data, loading, error } = useQuery<TicketCustomPropertiesResponse>(
    GET_TICKET_CUSTOM_PROPERTIES,
    options,
  );

  return {
    ticketCustomProperties: data?.reportTicketCustomProperties,
    loading,
    error,
  };
};
