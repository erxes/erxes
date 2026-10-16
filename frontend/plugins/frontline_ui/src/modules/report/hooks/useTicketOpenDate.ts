import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_DATE } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketDateQuery,
  ReportTicketDateQueryVariables,
} from '~/gql/graphql';

export const useTicketDate = (
  options?: QueryHookOptions<
    ReportTicketDateQuery,
    ReportTicketDateQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_DATE, options);

  return {
    ticketDate: data?.reportTicketDate,
    loading,
    error,
  };
};
