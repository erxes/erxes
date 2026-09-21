import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface ITicketPipeline {
  name: string;
  description?: string;
  channelId: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  state?: string;
  isCheckDate?: boolean;
  isCheckUser?: boolean;
  isCheckDepartment?: boolean;
  isCheckBranch?: boolean;
  isHideName?: boolean;
  excludeCheckUserIds?: string[];
  numberConfig?: string;
  numberSize?: string;
  nameConfig?: string;
  lastNum?: string;
  departmentIds?: string[];
  branchIds?: string[];
  tagId?: string;
  visibility?: string;
  memberIds?: string[];
  statusId?: string;
  propertyIds?: string[];
  isPropertySelectionConfigured?: boolean;
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
  extends ICursorPaginateParams, IListParams, ITicketPipeline {
  channelIds?: string[];
  userId?: string;
  createdAt?: Date;
  applyVisibilityFilter?: boolean;
}
