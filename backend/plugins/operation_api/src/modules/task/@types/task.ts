import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface ITask {
  name: string;
  teamId: string;
  description?: string;
  status?: string;
  priority?: number;
  labelIds?: string[];
  tagIds?: string[];
  assigneeId?: string;
  createdBy?: string;
  cycleId?: string | null;
  projectId?: string;
  estimatePoint?: number;
  userId?: string;
  startDate?: Date;
  targetDate?: Date;
  createdAt?: Date;
  statusChangedDate?: Date;
  statusType?: number;
}

export interface ITaskUpdate extends ITask {
  _id: string;
  number?: number;
}

export interface ITaskDocument extends ITask, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskFilter extends ICursorPaginateParams, IListParams, ITask {
  userId?: string;
  createdAt?: Date;
}
