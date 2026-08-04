import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from '~/utils';

export interface IAssignmentCampaign extends ICommonCampaignFields {
  segmentIds: string[];
  fieldId: string;
  voucherCampaignId: string;
  allowMultiWin?: boolean;
}

export interface IAssignmentCampaignDocument
  extends IAssignmentCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export interface IAssignmentCampaignParams extends ICursorPaginateParams {
  status?: string;
  searchValue?: string;
}
