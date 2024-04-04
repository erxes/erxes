import { commonSchema, ICommonDocument, ICommonFields } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';
import { LOTTERY_STATUS } from './constants';

export interface ILottery extends ICommonFields {
  status?: string;
  voucherCampaignId?: string;
}

export interface ILotteryDocument extends ILottery, ICommonDocument, Document {
  _id: string;
  number: string;

  // won
  awardId: string;
  voucherId: string;
}

export const lotterySchema = schemaHooksWrapper(
  new Schema({
    ...commonSchema,

    status: field({ type: String, enum: LOTTERY_STATUS.ALL, default: 'new' }),
    number: field({ type: String, optional: true, label: 'Lottery number' }),

    voucherCampaignId: field({
      type: String,
      label: 'Source Voucher Campaign',
      optional: true
    }),

    // won
    awardId: field({ type: String, label: 'Won award' }),
    voucherId: field({ type: String, label: 'Won Voucher', optional: true })
  }),
  'erxes_loyalty_lotteries'
);
