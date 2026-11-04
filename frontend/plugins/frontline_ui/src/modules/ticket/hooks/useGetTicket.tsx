import { GET_TICKET } from '@/ticket/graphql/queries/getTicket';
import { TICKET_CHANGED } from '@/ticket/graphql/subscriptions/ticketChanged';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import type { GetTicketQuery, GetTicketQueryVariables } from '~/gql/graphql';

/** Loads ticket detail and optionally subscribes to its live changes. */
export const useGetTicket = (
  options: QueryHookOptions<GetTicketQuery, GetTicketQueryVariables> & {
    subscribe?: boolean;
  },
) => {
  const { subscribe = true, ...queryOptions } = options;
  const { data, loading, refetch, subscribeToMore, error } = useQuery(
    GET_TICKET,
    queryOptions,
  );

  const ticket = data?.getTicket ?? undefined;
  const ticketId = ticket?._id;

  useEffect(() => {
    const unsubscribe =
      subscribe && ticketId
        ? subscribeToMore({
            document: TICKET_CHANGED,
            variables: { _id: ticketId },
            updateQuery: (prev, { subscriptionData }) => {
              const changed = subscriptionData.data?.ticketChanged;

              if (!changed) return prev;

              const { type, ticket: newTicket } = changed;

              if (type === 'delete') return { ...prev, getTicket: null };
              if (!newTicket) return prev;

              return {
                getTicket: {
                  ...prev.getTicket,
                  ...newTicket,
                },
              };
            },
          })
        : undefined;

    return () => {
      unsubscribe?.();
    };
  }, [ticketId, subscribeToMore, subscribe]);

  return { ticket, loading, refetch, error };
};
