import { Document, Schema } from 'mongoose';
import { field } from './utils';
import {
  commonCampaignSchema,
  ICommonCampaignFields,
  ICommonCampaignDocument
} from './common';

export interface ISpinAward extends Document {
  _id: string;
  name: string;
  voucherCampaignId: string;
  probability: number;
}

export interface ISpinCampaign extends ICommonCampaignFields {
  buyScore?: number;
  awards?: ISpinAward[];
}

export interface ISpinCampaignDocument
  extends ISpinCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

const spinAwardSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String },
    voucherCampaignId: { type: String },
    probability: { type: Number, max: 100, min: 0 }
  },
  { _id: false }
);

export const spinCampaignSchema = new Schema({
  ...commonCampaignSchema,

  buyScore: field({ type: Number }),

  awards: field({ type: [spinAwardSchema] })
});
