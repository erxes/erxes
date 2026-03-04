import { ITicket } from '@/ticket/types';
import { useQuery } from '@apollo/client';
import { GET_TICKET } from '@/ticket/graphql/queries/getTicket';
import { TICKET_CHANGED } from '@/ticket/graphql/subscriptions/ticketChanged';
import { QueryHookOptions } from '@apollo/client';
import { useEffect } from 'react';

interface IGetTicketQueryResponse {
  getTicket: ITicket;
}

interface ITicketChanged {
  ticketChanged: {
    type: string;
    ticket: ITicket;
  };
}

export const useGetTicket = (options: QueryHookOptions) => {
  const { data, loading, refetch, subscribeToMore, error } =
    useQuery<IGetTicketQueryResponse>(GET_TICKET, options);

  const ticket = data?.getTicket;

  useEffect(() => {
    const unsubscribe = subscribeToMore<ITicketChanged>({
      document: TICKET_CHANGED,
      variables: { _id: ticket?._id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newTicket = subscriptionData.data.ticketChanged.ticket;

        return {
          getTicket: newTicket,
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [ticket?._id, subscribeToMore]);

  return { ticket, loading, refetch, error };
};
