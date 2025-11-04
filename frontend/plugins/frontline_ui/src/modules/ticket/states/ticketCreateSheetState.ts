import { atom } from 'jotai';
import { TAddTicket } from '@/ticket/types';

export const ticketCreateSheetState = atom(false);
export const ticketCreateDefaultValuesState = atom<Partial<TAddTicket> | undefined>(
  undefined,
);
