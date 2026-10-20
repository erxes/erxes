import type { ReactNode } from 'react';
import type { ITicketDetail } from '@/ticket/types';

export type TicketDetailsProps = {
  ticketId: string;
  titleAction?: ReactNode;
};

export type TicketFieldsProps = {
  ticket: ITicketDetail;
  titleAction?: ReactNode;
};
