import { atomWithStorage } from 'jotai/utils';
import {
  TicketSortDirection,
  TicketSortField,
} from '@/ticket/hooks/useGetTickets';

export const ticketSortAtom = atomWithStorage<TicketSortField>(
  'ticketSort',
  'updatedAt',
  undefined,
  { getOnInit: true },
);

export const ticketSortDirectionAtom = atomWithStorage<TicketSortDirection>(
  'ticketSortDirection',
  -1,
  undefined,
  { getOnInit: true },
);
