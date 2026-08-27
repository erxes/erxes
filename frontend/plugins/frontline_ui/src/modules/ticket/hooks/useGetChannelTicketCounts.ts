import { GET_TICKET_CHANNEL_COUNT } from '@/ticket/graphql/queries/getTickets';
import { TICKET_LIST_CHANGED } from '@/ticket/graphql/subscriptions/ticketListChanged';
import { useApolloClient, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';

interface IChannelTicketCountResponse {
  getTickets: {
    totalCount: number;
  };
}

interface ITicketListChangedResponse {
  ticketListChanged: {
    type: string;
  };
}

export const useGetChannelTicketCounts = (channelIds: string[]) => {
  const client = useApolloClient();
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { data: ticketListChangedData } =
    useSubscription<ITicketListChangedResponse>(TICKET_LIST_CHANGED, {
      variables: { filter: { state: 'all' } },
    });

  useEffect(() => {
    let isCurrent = true;

    if (!channelIds.length) {
      setTicketCounts({});
      setLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    setLoading(true);

    Promise.all(
      channelIds.map(async (channelId) => {
        const { data } = await client.query<IChannelTicketCountResponse>({
          query: GET_TICKET_CHANNEL_COUNT,
          variables: {
            filter: {
              channelId,
              state: 'all',
              limit: 1,
              direction: 'forward',
            },
          },
          fetchPolicy: 'network-only',
        });

        return [channelId, data.getTickets.totalCount] as const;
      }),
    )
      .then((counts) => {
        if (isCurrent) {
          setTicketCounts(Object.fromEntries(counts));
        }
      })
      .catch(() => {
        if (isCurrent) {
          setTicketCounts({});
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [channelIds, client, ticketListChangedData]);

  return { ticketCounts, loading };
};
