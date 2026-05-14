import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument, ICommonFields } from '~/utils';

export interface IAssignment extends ICommonFields {
  segmentIds?: string[];
  status?: string;
  voucherId?: string;
  voucherCampaignId?: string;
}

export interface IAssignmentDocument
  extends IAssignment,
    ICommonDocument,
    Document {
  _id: string;
}

export interface IAssignmentParams extends ICursorPaginateParams {
  searchValue?: string;
  campaignId?: string;
  ownerType?: string;
  ownerId?: string;
  status?: string;
  statuses?: string[];
  awardId?: string;
}

export interface IAssignmentCheckResponse {
  segmentId: string;
  isIn: boolean;
}
