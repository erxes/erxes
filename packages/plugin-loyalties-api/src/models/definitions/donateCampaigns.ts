import { Document, Schema } from 'mongoose';
import { field } from './utils';
import {
  commonCampaignSchema,
  ICommonCampaignFields,
  ICommonCampaignDocument
} from './common';

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

const donateAwardSchema = new Schema(
  {
    _id: { type: String },
    minScore: { type: Number },
    voucherCampaignId: { type: String }
  },
  { _id: false }
);

export const donateCampaignSchema = new Schema({
  ...commonCampaignSchema,

  awards: field({ type: [donateAwardSchema] }),
  maxScore: field({ type: Number })
});
