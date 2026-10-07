import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TICKET_CUSTOM_PROPERTIES } from '@/report/graphql/queries/getTicketChart';
import type {
  ReportTicketCustomPropertiesQuery,
  ReportTicketCustomPropertiesQueryVariables,
} from '~/gql/graphql';

export const useTicketCustomProperties = (
  options?: QueryHookOptions<
    ReportTicketCustomPropertiesQuery,
    ReportTicketCustomPropertiesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    GET_TICKET_CUSTOM_PROPERTIES,
    options,
  );

  return {
    ticketCustomProperties:
      data?.reportTicketCustomProperties?.filter(isDefined),
    loading,
    error,
  };
};
