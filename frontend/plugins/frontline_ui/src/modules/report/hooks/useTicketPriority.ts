import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_PRIORITY } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketPriorityQuery,
  ReportTicketPriorityQueryVariables,
} from '~/gql/graphql';

export type TicketPriorityItem = NonNullable<
  NonNullable<ReportTicketPriorityQuery['reportTicketPriority']>[number]
>;

export const useTicketPriority = (
  options?: QueryHookOptions<
    ReportTicketPriorityQuery,
    ReportTicketPriorityQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_PRIORITY, options);

  return {
    priorityData: data?.reportTicketPriority?.filter(isDefined),
    loading,
    error,
  };
};
