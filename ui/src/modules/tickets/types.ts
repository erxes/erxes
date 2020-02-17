import { IItem, IItemParams } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface ITicket extends IItem {
  channel?: string;
}

export interface ITicketParams extends IItemParams {
  source?: string;
}
