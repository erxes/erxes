import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import type { TAddTicket } from '@/ticket/types';

export type TTicketCreateSession = {
  generation: number;
  defaults: TAddTicket;
  pending?: symbol;
  onCreated?: (ticketId: string) => void;
};

export const ticketCreateSessionsState = atomFamily(
  ({ defaults }: { key: string; defaults: TAddTicket }) =>
    atom<TTicketCreateSession>({ generation: 0, defaults }),
  (previous, next) => previous.key === next.key,
);
