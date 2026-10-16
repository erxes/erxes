import { GET_TICKET } from '@/ticket/graphql/queries/getTicket';
import { TICKET_CHANGED } from '@/ticket/graphql/subscriptions/ticketChanged';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import type { GetTicketQuery, GetTicketQueryVariables } from '~/gql/graphql';

export const useGetTicket = (
  options: QueryHookOptions<GetTicketQuery, GetTicketQueryVariables>,
) => {
  const { data, loading, refetch, subscribeToMore, error } = useQuery(
    GET_TICKET,
    options,
  );

  const ticket = data?.getTicket ?? undefined;
  const ticketId = ticket?._id;

  useEffect(() => {
    if (!ticketId) return;

    const unsubscribe = subscribeToMore({
      document: TICKET_CHANGED,
      variables: { _id: ticketId },
      updateQuery: (prev, { subscriptionData }) => {
        const changed = subscriptionData.data?.ticketChanged;

        if (!changed) return prev;

        const { type, ticket: newTicket } = changed;

        if (type === 'delete' || !newTicket) return prev;

        return {
          getTicket: {
            ...prev.getTicket,
            ...newTicket,
          },
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [ticketId, subscribeToMore]);

  return { ticket, loading, refetch, error };
};
