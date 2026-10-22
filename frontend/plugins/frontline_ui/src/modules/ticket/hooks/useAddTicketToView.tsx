import { useSetAtom } from 'jotai';
import { ITicket } from '../types';
import { fetchedTicketsState } from '../states/fetchedTicketState';
import { allTicketsMapState } from '../states/allTicketsMapState';
import { ticketCountByBoardAtom } from '../states/ticketsTotalCountState';

export const useAddTicketToView = () => {
  const setFetchedTickets = useSetAtom(fetchedTicketsState);
  const setAllTicketsMap = useSetAtom(allTicketsMapState);
  const setTicketCountByBoard = useSetAtom(ticketCountByBoardAtom);

  const addTicketToView = (ticket: ITicket) => {
    const statusId = ticket.statusId ?? '';

    setAllTicketsMap((prev) => ({ ...prev, [ticket._id]: ticket }));
    setFetchedTickets((prev) => {
      if (prev.some((item) => item.id === ticket._id)) {
        return prev;
      }
      return [
        { id: ticket._id, column: statusId, sort: ticket.updatedAt },
        ...prev,
      ];
    });
    setTicketCountByBoard((prev) => ({
      ...prev,
      [statusId]: (prev[statusId] || 0) + 1,
    }));
  };

  return { addTicketToView };
};
