import { Document } from 'mongoose';

/**
 * Assignment campaign base fields
 */
export interface IAssignmentCampaign {
  name: string;
  description?: string;

  status?: string;

  segmentIds: string[];
  fieldId: string;
  voucherCampaignId: string;
  allowMultiWin?: boolean;

  createdBy?: string;
  updatedBy?: string;
}

/**
 * Assignment campaign mongoose document
 */
export interface IAssignmentCampaignDocument
  extends IAssignmentCampaign,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
