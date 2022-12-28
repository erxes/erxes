import { Document, Schema } from 'mongoose';
import {
  commonCampaignSchema,
  ICommonCampaignFields,
  ICommonCampaignDocument
} from './common';
import { field } from './utils';

export interface IAssignmentCampaign extends ICommonCampaignFields {
  segmentIds: string[];
  voucherCampaignId: string;
}

export interface IAssignmentCampaignDocument
  extends IAssignmentCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export const assignmentCampaignSchema = new Schema({
  ...commonCampaignSchema,
  segmentIds: field({ type: [String], label: 'Segment Data' }),
  voucherCampaignId: field({ type: String, label: 'Voucher Campaign Id' })
});
