import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface ITicketPipeline {
  _id?: string;
  name: string;
  description?: string;
  channelId: string;
  userId?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITicketPipelineUpdate extends ITicketPipeline {
  _id: string;
}
export interface ITicketPipelineDocument extends ITicketPipeline, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketsPipelineFilter
  extends ICursorPaginateParams,
    IListParams,
    ITicketPipeline {
  userId?: string;
  createdAt?: Date;
}
