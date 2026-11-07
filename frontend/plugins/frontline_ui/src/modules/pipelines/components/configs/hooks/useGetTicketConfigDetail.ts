import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONFIG_DETAIL } from '../graphql';
import type {
  TicketConfigDetailQuery,
  TicketConfigDetailQueryVariables,
} from '~/gql/graphql';

export type ITicketConfigDetail = NonNullable<
  TicketConfigDetailQuery['ticketConfigDetail']
>;

/** Loads a ticket configuration with its loading and error state. */
export const useGetTicketConfigDetail = (
  options?: QueryHookOptions<
    TicketConfigDetailQuery,
    TicketConfigDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_CONFIG_DETAIL, options);
  return {
    ticketConfigDetail: data?.ticketConfigDetail ?? undefined,
    loading,
    error,
  };
};
