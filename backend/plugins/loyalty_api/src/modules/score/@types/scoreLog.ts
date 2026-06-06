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
  amount?: number;
  quantity?: number;
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
  clientPortal?: string;
  orderType?: string;
  number?: string;
  description?: string;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  contentId?: string;
  contentType?: string;
  searchValue?: string;
  logsPerOwner?: number;
}

export interface IRepairOwnerScoreParams {
  ownerType: string;
  ownerId: string;
}

export interface IRepairedOwnerFieldScore {
  fieldId: string;
  score: number;
  campaignIds: string[];
}

export interface IRepairOwnerScoreResult {
  ownerType: string;
  ownerId: string;
  updatedScore?: number;
  updatedCustomFieldsData?: Record<string, unknown>;
  fieldScores: IRepairedOwnerFieldScore[];
}
