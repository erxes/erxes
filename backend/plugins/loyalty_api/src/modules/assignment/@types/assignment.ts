import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IAssignment {
  ownerId: string;
  ownerType: string;
  campaignId: string;

  status?: string;

  conditions?: any;

  createdBy?: string;
  updatedBy?: string;
}

export interface IAssignmentDocument extends IAssignment, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignmentListParams extends ICursorPaginateParams {
  searchValue?: string;
  campaignId?: string;
  ownerType?: string;
  ownerId?: string;
  status?: string;
  statuses?: string[];
  awardId?: string;
}
