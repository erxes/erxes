import { useAtomValue, useSetAtom } from 'jotai';
import { fetchedTicketsState } from '../states/fetchedTicketState';
import { allTicketsMapState } from '../states/allTicketsMapState';
import { ticketCountByBoardAtom } from '../states/ticketsTotalCountState';


export const useRemoveTicketsFromView = () => {
  const allTicketsMap = useAtomValue(allTicketsMapState);
  const setFetchedTickets = useSetAtom(fetchedTicketsState);
  const setAllTicketsMap = useSetAtom(allTicketsMapState);
  const setTicketCountByBoard = useSetAtom(ticketCountByBoardAtom);

  const removeTicketsFromView = (ticketIds: string[]) => {
    setFetchedTickets((prev) =>
      prev.filter((ticket) => !ticketIds.includes(ticket.id)),
    );
    setTicketCountByBoard((prev) => {
      const counts = { ...prev };
      ticketIds.forEach((id) => {
        const statusId = allTicketsMap[id]?.statusId;
        if (statusId && counts[statusId]) {
          counts[statusId] = Math.max(counts[statusId] - 1, 0);
        }
      });
      return counts;
    });
    setAllTicketsMap((prev) => {
      const map = { ...prev };
      ticketIds.forEach((id) => {
        delete map[id];
      });
      return map;
    });
  };

  return { removeTicketsFromView };
};
