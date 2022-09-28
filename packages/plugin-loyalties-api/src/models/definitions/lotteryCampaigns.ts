import { Document, Schema } from 'mongoose';
import { field } from './utils';
import {
  commonCampaignSchema,
  ICommonCampaignFields,
  ICommonCampaignDocument
} from './common';

export interface ILotteryAward extends Document {
  _id: string;
  name: string;
  voucherCampaignId: string;
  count: number;
  wonLotteryIds: string[];
}

export interface ILotteryCampaign extends ICommonCampaignFields {
  numberFormat: string;
  buyScore: number;

  awards: ILotteryAward[];
}

export interface ILotteryCampaignDocument
  extends ILotteryCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

const lotteryAwardSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String },
    voucherCampaignId: { type: String },
    count: { type: Number, min: 0 },
    wonLotteryIds: { type: [String], optional: true }
  },
  { _id: false }
);

export const lotteryCampaignSchema = new Schema({
  ...commonCampaignSchema,

  numberFormat: field({ type: String, label: 'Number format type' }),
  buyScore: field({ type: Number }),

  awards: field({ type: [lotteryAwardSchema] })
});
