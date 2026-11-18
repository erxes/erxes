import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

import type { TTicketSlaPolicy } from './sla';

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
  createLayout?: string[][] | null;
  slaPolicy?: TTicketSlaPolicy | null;
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
  userId?: string;
  createdAt?: Date;
  applyVisibilityFilter?: boolean;
}

export interface ICpTicketPipelineFilter extends ICursorPaginateParams {
  channelId?: string;
  name?: string;
}
