import { useSetAtom } from 'jotai';
import { ITicket } from '../types';
import { fetchedTicketsState } from '../states/fetchedTicketState';
import { allTicketsMapState } from '../states/allTicketsMapState';
import { ticketCountByBoardAtom } from '../states/ticketsTotalCountState';
import { useTicketsVariables } from './useGetTickets';

export const useAddTicketToView = () => {
  const {
    segmentIds,
    createdStartDate,
    createdEndDate,
    startDateStartDate,
    startDateEndDate,
    targetDateStartDate,
    targetDateEndDate,
    statusChangedStartDate,
    statusChangedEndDate,
  } = useTicketsVariables();
  const setFetchedTickets = useSetAtom(fetchedTicketsState);
  const setAllTicketsMap = useSetAtom(allTicketsMapState);
  const setTicketCountByBoard = useSetAtom(ticketCountByBoardAtom);

  const addTicketToView = (ticket: ITicket) => {
    if (
      segmentIds?.length ||
      createdStartDate ||
      createdEndDate ||
      startDateStartDate ||
      startDateEndDate ||
      targetDateStartDate ||
      targetDateEndDate ||
      statusChangedStartDate ||
      statusChangedEndDate
    ) {
      return;
    }

    setAllTicketsMap((prev) => ({ ...prev, [ticket._id]: ticket }));
    setFetchedTickets((prev) => {
      if (prev.some((item) => item.id === ticket._id)) {
        return prev;
      }
      return [
        ...prev,
        { id: ticket._id, column: ticket.statusId, sort: ticket.updatedAt },
      ];
    });
    setTicketCountByBoard((prev) => ({
      ...prev,
      [ticket.statusId]: (prev[ticket.statusId] || 0) + 1,
    }));
  };

  return { addTicketToView };
};
