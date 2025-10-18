import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

type DateRange = {
  from?: Date;
  to?: Date;
};
export interface ITicket {
  name: string;
  channelId: string;
  pipelineId: string;
  statusId: string;
  description?: string;
  type?: 'bug' | 'task' | 'feature' | 'question' | 'incident';
  priority?: number;
  labelIds?: string[];
  tagIds?: string[];
  status?: string;
  assigneeId?: string;
  createdBy?: string;
  startDate?: Date | DateRange;
  targetDate?: Date | DateRange;
  createdAt?: Date | DateRange;
  statusChangedDate?: Date | DateRange;
  statusType?: number;
}

export interface ITicketUpdate extends ITicket {
  _id: string;
  number?: number;
}

export interface ITicketDocument extends ITicket, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketFilter
  extends ICursorPaginateParams,
    IListParams,
    ITicket {
  userId?: string;
  createdAt?: Date;
}
