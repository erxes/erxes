import { Document } from 'mongoose';

/**
 * Embedded donate award
 */
export interface IDonateAward {
  _id: string;
  minScore: number;
  voucherCampaignId: string;
}

/**
 * Donate campaign base fields
 */
export interface IDonateCampaign {
  name: string;
  description?: string;

  status?: string;

  awards?: IDonateAward[];
  maxScore?: number;

  createdBy?: string;
  updatedBy?: string;
}

/**
 * Donate campaign mongoose document
 */
export interface IDonateCampaignDocument
  extends IDonateCampaign,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
