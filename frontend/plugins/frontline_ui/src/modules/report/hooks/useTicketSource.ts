import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_SOURCE } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketSourceQuery,
  ReportTicketSourceQueryVariables,
} from '~/gql/graphql';

export const useTicketSource = (
  options?: QueryHookOptions<
    ReportTicketSourceQuery,
    ReportTicketSourceQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_SOURCE, options);

  return {
    ticketSources: data?.reportTicketSource?.filter(isDefined),
    loading,
    error,
  };
};
