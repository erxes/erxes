import { IItem, IItemParams } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface ITicket extends IItem {
  source?: string;
}

export interface ITicketParams extends IItemParams {
  source?: string;
}

export type TicketsQueryResponse = {
  tickets: ITicket[];
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type TicketsTotalCountQueryResponse = {
  ticketsTotalCount: number;
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};
