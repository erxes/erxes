import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_OPEN } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketOpenQuery,
  ReportTicketOpenQueryVariables,
} from '~/gql/graphql';

export const useTicketOpen = (
  options?: QueryHookOptions<
    ReportTicketOpenQuery,
    ReportTicketOpenQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_OPEN, options);

  return {
    ticketOpen: data?.reportTicketOpen,
    loading,
    error,
  };
};
