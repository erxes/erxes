import { Document } from 'mongoose';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
export interface IScoreLog {
  ownerId: string;
  ownerType: string;

  campaignId?: string;

  action: 'add' | 'subtract' | 'refund';
  change: number;

  contentId?: string;
  contentType?: string;

  targetId?: string;
  serviceName?: string;

  description?: string;

  sourceScoreLogId?: string;

  createdBy?: string;
}

export interface IScoreLogDocument extends IScoreLog, Document {
  createdAt: Date;
  updatedAt: Date;
}
export interface IScoreLogParams extends ICursorPaginateParams {
  ownerType?: string;
  ownerId?: string;
  campaignId?: string;
  action?: string;
  contentId?: string;
  contentType?: string;
}