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

export const spinAwardSchema = new Schema(
  {
    _id: field({ type: String }),
    name: field({ type: String, label: 'Name' }),
    voucherCampaignId: field({ type: String, label: 'Voucher campaign' }),
    probability: field({ type: Number, label: 'Probability', max: 100, min: 0 })
  },
  { _id: false }
);

export const spinCampaignSchema = new Schema({
  ...commonCampaignSchema,

  buyScore: field({ type: Number }),

  awards: field({ type: [spinAwardSchema], label: 'Awards' })
});
