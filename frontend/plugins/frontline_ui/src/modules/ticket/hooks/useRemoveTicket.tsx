import { useMutation } from '@apollo/client';
import { GET_TICKETS } from '../graphql/queries/getTickets';
import { REMOVE_TICKET } from '../graphql/mutations/removeTicket';
import { useStore } from 'jotai';
import { currentUserState } from 'ui-modules';
import {
  markTicketsRemoved,
  unmarkTicketsRemoved,
  ticketRemovedIdsState,
} from '../states/removedTicketsState';
import { useRemoveTicketsFromView } from './useRemoveTicketsFromView';

export const useTicketRemove = () => {
  const [_removeTicket, { loading }] = useMutation(REMOVE_TICKET);
  const { removeTicketsFromView } = useRemoveTicketsFromView();
  const store = useStore();
  const removeTicket = async (ticketIds: string[]) => {
    markTicketsRemoved(ticketIds);
    const userId = store.get(currentUserState)?._id;
    let sameSession = true;
    const unsubscribe = store.sub(currentUserState, () => {
      if (store.get(currentUserState)?._id !== userId) sameSession = false;
    });

    try {
      await _removeTicket({
        variables: { _id: ticketIds },
        update: (cache) => {
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'getTickets' });
          ticketIds.forEach((_id) => {
            cache.evict({
              id: 'ROOT_QUERY',
              fieldName: 'getTicket',
              args: { _id },
            });
            const cacheId = cache.identify({ __typename: 'Ticket', _id });
            if (cacheId) cache.evict({ id: cacheId });
          });
          cache.gc();
        },
        refetchQueries: [GET_TICKETS],
      });
    } catch (e) {
      unmarkTicketsRemoved(ticketIds);
      throw e;
    } finally {
      unsubscribe();
    }

    if (sameSession)
      store.set(ticketRemovedIdsState, (previous) => ({
        ids:
          previous.userId === userId
            ? [...new Set([...previous.ids, ...ticketIds])]
            : ticketIds,
        userId,
      }));

    removeTicketsFromView(ticketIds);
  };

  return { removeTicket, loading };
};
