import { atomWithStorage } from 'jotai/utils';
import { TicketSortField } from '@/ticket/hooks/useGetTickets';

export const ticketSortAtom = atomWithStorage<TicketSortField>(
  'ticketSort',
  'updatedAt',
  undefined,
  { getOnInit: true },
);
