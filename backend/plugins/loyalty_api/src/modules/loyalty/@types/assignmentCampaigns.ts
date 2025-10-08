import { Document, Schema } from 'mongoose';
import { ICommonCampaignFields, ICommonCampaignDocument } from './common';
import { field } from './utils';

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
