import { TCreatedVia } from 'erxes-api-shared/core-types';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument } from '~/utils';
import { IEarnBreakdownItem } from '@/score/@types/earnTable';

export interface IScoreLog {
  ownerType: string;
  ownerId: string;
  ownerIds?: string[];
  preScore?: number;
  changeScore: number;
  description: string;
  createdBy?: string;
  // What produced the entry when nobody typed it in: an automation, a
  // wallet's period run.
  createdVia?: TCreatedVia;
  campaignId?: string;
  // Stamped on every write; campaign-less entries (resets) have only this.
  accountTypeId?: string;
  accountId?: string;
  // Earning table rows this entry came from.
  breakdown?: IEarnBreakdownItem[];
  serviceName?: string;
  sourceScoreLogId?: string;
  targetId?: string;
  // The record type of targetId, e.g. `sales:sales.deals`.
  targetType?: string;
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
  targetId?: string;
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
