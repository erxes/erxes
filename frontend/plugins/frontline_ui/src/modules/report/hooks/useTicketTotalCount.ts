import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_TOTAL_COUNT } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketTotalCountQuery,
  ReportTicketTotalCountQueryVariables,
} from '~/gql/graphql';

export const useTicketTotalCount = (
  options?: QueryHookOptions<
    ReportTicketTotalCountQuery,
    ReportTicketTotalCountQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_TOTAL_COUNT, options);

  return {
    totalCount: data?.reportTicketTotalCount ?? 0,
    loading,
    error,
  };
};
