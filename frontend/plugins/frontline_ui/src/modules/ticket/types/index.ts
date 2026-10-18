import type {
  FrontlineTicketFieldsFragment,
  GetTicketQuery,
} from '~/gql/graphql';
import { addTicketSchema } from './validations';
import { z } from 'zod';

export type ITicket = FrontlineTicketFieldsFragment;

export type ITicketDetail = NonNullable<GetTicketQuery['getTicket']>;

export type TAddTicket = z.infer<typeof addTicketSchema>;

export * from './validations';
export * from './ticketHotkeyScope';
