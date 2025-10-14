import { ICursorPaginateParams, IListParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IMilestone {
  name: string;
  description: string;
  targetDate: Date;
  projectId: string;
  createdBy: string;
}

export interface IMilestoneDocument extends IMilestone, Document {
  _id: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMilestoneParams extends IListParams,ICursorPaginateParams {
  projectId: string;
}
