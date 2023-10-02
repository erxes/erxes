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

export const donateAwardSchema = new Schema(
  {
    _id: field({ pkey: true }),
    minScore: field({ type: Number, label: 'Min score' }),
    voucherCampaignId: field({ type: String, label: 'Voucher campaign' })
  },
  { _id: false }
);

export const donateCampaignSchema = new Schema({
  ...commonCampaignSchema,

  awards: field({ type: [donateAwardSchema], label: 'Awards' }),
  maxScore: field({ type: Number })
});
