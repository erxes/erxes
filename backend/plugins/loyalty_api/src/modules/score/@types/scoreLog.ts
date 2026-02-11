import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument } from '~/utils';

export interface IScoreLog {
  ownerType: string;
  ownerId: string;
  ownerIds?: string[];
  changeScore: number;
  description: string;
  createdBy?: string;
  campaignId?: string;
  serviceName?: string;
  sourceScoreLogId?: string;
  targetId?: string;
  action?: string;
}

export interface IScoreLogDocument
  extends IScoreLog,
    ICommonDocument,
    Document {
  _id: string;
}

export interface IScoreLogParams extends ICursorPaginateParams {
  ownerType: string;
  ownerId: string;
  fromDate?: string;
  toDate?: string;
  campaignId?: string;
  action?: string;
  number?: string;
  stageId?: string;
  contentId?: string;
  contentType?: string;
  searchValue?: string;
}
