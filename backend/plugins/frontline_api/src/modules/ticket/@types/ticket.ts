import { IListParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

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
  subscribedUserIds?: string[];
  isSubscribed?: boolean;
}

export interface ITicketUpdate extends ITicket {
  _id: string;
}

export interface ITicketDocument extends ITicket, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketFilter extends IListParams, ITicket {
  userId?: string;
  createdAt?: Date;
}
