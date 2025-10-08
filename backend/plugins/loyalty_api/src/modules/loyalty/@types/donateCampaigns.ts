import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { ICommonCampaignFields, ICommonCampaignDocument } from './common';

export interface IDonateAward extends Document {
  _id: string;
  minScore: number;
  voucherCampaignId: string;
}

export interface IDonateCampaign extends ICommonCampaignFields {
  awards?: IDonateAward[];
  maxScore?: number;
}

export interface IDonateCampaignDocument
  extends IDonateCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}
