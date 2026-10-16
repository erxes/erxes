import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_STATUS_SUMMARY } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketStatusSummaryQuery,
  ReportTicketStatusSummaryQueryVariables,
} from '~/gql/graphql';

export type TicketStatusSummaryItem = NonNullable<
  NonNullable<
    ReportTicketStatusSummaryQuery['reportTicketStatusSummary']
  >[number]
>;

export const useTicketStatusSummary = (
  options?: QueryHookOptions<
    ReportTicketStatusSummaryQuery,
    ReportTicketStatusSummaryQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_STATUS_SUMMARY, options);

  return {
    statusSummary: data?.reportTicketStatusSummary?.filter(isDefined),
    loading,
    error,
  };
};
