import { Document, Schema } from 'mongoose';
import {
  commonCampaignSchema,
  ICommonCampaignFields,
  ICommonCampaignDocument
} from './common';
import { field } from './utils';

export interface IAssignmentCampaign extends ICommonCampaignFields {
  segmentData?: string;
}

export interface IAssignmentCampaignDocument
  extends IAssignmentCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export const assignmentCampaignSchema = new Schema({
  ...commonCampaignSchema,
  segmentData: field({ type: String, label: 'Segment Data' })
});
