import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface ITicket {
  name: string;
  channelId: string;
  pipelineId: string;
  statusId?: string;
  description?: string;
  priority?: number;
  labelIds?: string[];
  tagIds?: string[];
  status?: string;
  assigneeId?: string;
  createdBy?: string;
  userId?: string;
  startDate?: Date;
  targetDate?: Date;
  createdAt?: Date;
  statusChangedDate?: Date;
  statusType?: number;
  number?: string;
}

export interface ITicketUpdate extends ITicket {
  _id: string;
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
