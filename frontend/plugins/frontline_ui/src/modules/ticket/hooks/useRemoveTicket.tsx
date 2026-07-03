import { useMutation } from '@apollo/client';
import { useAtom } from 'jotai';
import { GET_TICKETS } from '../graphql/queries/getTickets';
import { REMOVE_TICKET } from '../graphql/mutations/removeTicket';
import { ticketDetailSheetState } from '../states/ticketDetailSheetState';
import {
  markTicketsRemoved,
  unmarkTicketsRemoved,
} from '../states/removedTicketsState';
import { useRemoveTicketsFromView } from './useRemoveTicketsFromView';

export const useTicketRemove = () => {
  const [_removeTicket, { loading }] = useMutation(REMOVE_TICKET);
  const { removeTicketsFromView } = useRemoveTicketsFromView();
  const [activeTicket, setActiveTicket] = useAtom(ticketDetailSheetState);
  const removeTicket = async (ticketIds: string[]) => {

    markTicketsRemoved(ticketIds);

    try {
      await _removeTicket({
        variables: { _id: ticketIds },
        refetchQueries: [GET_TICKETS],
      });
    } catch (e) {
      unmarkTicketsRemoved(ticketIds);
      throw e;
    }

    if (activeTicket && ticketIds.includes(activeTicket)) {
      setActiveTicket(null);
    }

    removeTicketsFromView(ticketIds);
  };

  return { removeTicket, loading };
};
