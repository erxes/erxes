import { Document } from 'mongoose';
import {
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export type CycleFilterType =
  | 'noCycle'
  | 'anyPastCycle'
  | 'previousCycle'
  | 'currentCycle'
  | 'upcomingCycle'
  | 'anyFutureCycle';

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
  milestoneId?: string | null;
  projectId?: string;
  estimatePoint?: number;
  userId?: string;
  startDate?: Date | string;
  targetDate?: Date | string;
  createdAt?: Date | string;
  statusChangedDate?: Date | string;
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
  cycleFilter?: CycleFilterType;
  projectStatus?: number;
  projectPriority?: number;
  projectLeadId?: string;
  projectMilestoneName?: string;
  createdDate?: string;
  updatedDate?: string;
  completedDate?: string;
}

export interface ITaskImportRow {
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  status?: string;
  Status?: string;
  team?: string;
  Team?: string;
  priority?: string | number;
  Priority?: string | number;
  assignee?: string;
  Assignee?: string;
  startDate?: string | Date;
  'Start Date'?: string | Date;
  targetDate?: string | Date;
  'Target Date'?: string | Date;
  estimatePoint?: string | number;
  'Estimate Point'?: string | number;
  project?: string;
  Project?: string;
  cycle?: string;
  Cycle?: string;
  milestone?: string;
  Milestone?: string;
  labels?: string | string[];
  Labels?: string | string[];
  tags?: string | string[];
  Tags?: string | string[];
}
