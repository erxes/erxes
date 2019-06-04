import { IItem } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';

export type RemoveTicketVariables = {
  _id: string;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export interface ITicket extends IItem {
  channel?: string;
}

export interface ITicketParams {
  _id?: string;
  name: string;
  stageId: string;
  assignedUserIds?: string[];
  companyIds?: string[];
  customerIds?: string[];
  closeDate?: Date;
  description?: string;
  priority?: string;
  source?: string;
  order?: number;
}

export type TicketsQueryResponse = {
  tickets: ITicket[];
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type TicketDetailQueryResponse = {
  ticketDetail: ITicket;
  loading: boolean;
};

export type SaveTicketMutation = ({ variables: ITicketParams }) => Promise<any>;
