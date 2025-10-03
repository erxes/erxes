import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface IProject {
  name: string;
  description?: string;
  teamIds: string[];
  priority: number;
  startDate?: Date;
  status: number;
  targetDate?: Date;
  leadId?: string;
}

export interface IProjectFilter extends ICursorPaginateParams, IListParams {
  _ids?: string[];
  name?: string;
  description?: string;
  teamIds?: string[];
  priority: number;
  startDate?: Date;
  targetDate?: Date;
  leadId?: string;
  status?: number;
  userId?: string;
  active?: boolean;
  taskId?: string;
}

export interface IProjectUpdate extends IProject {
  _id: string;
}

export interface IProjectDocument extends IProject, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
