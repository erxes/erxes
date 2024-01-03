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

export const lotteryAwardSchema = new Schema(
  {
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    voucherCampaignId: field({ type: String, label: 'Voucher campaign' }),
    count: field({ type: Number, label: 'Count', min: 0 }),
    wonLotteryIds: field({
      type: [String],
      label: 'Won lottery ids',
      optional: true
    })
  },
  { _id: false }
);

export const lotteryCampaignSchema = new Schema({
  ...commonCampaignSchema,

  numberFormat: field({ type: String, label: 'Number format type' }),
  buyScore: field({ type: Number }),

  awards: field({ type: [lotteryAwardSchema], label: 'Awards' })
});
