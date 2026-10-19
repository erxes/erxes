import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_TAGS } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketTagsQuery,
  ReportTicketTagsQueryVariables,
} from '~/gql/graphql';

export const useTicketTags = (
  options?: QueryHookOptions<
    ReportTicketTagsQuery,
    ReportTicketTagsQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_TICKET_TAGS, options);

  return {
    ticketTags: data?.reportTicketTags?.filter(isDefined),
    loading,
    error,
  };
};
