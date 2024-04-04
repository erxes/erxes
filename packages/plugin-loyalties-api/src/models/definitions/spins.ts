import { commonSchema, ICommonFields, ICommonDocument } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';
import { SPIN_STATUS } from './constants';

export interface ISpin extends ICommonFields {
  status?: string;
  voucherCampaignId?: string;
}

export interface ISpinDocument extends ISpin, ICommonDocument, Document {
  _id: string;
  status: string;

  // won
  awardId: string;
  voucherId: string;
}

export const spinSchema = schemaHooksWrapper(
  new Schema({
    ...commonSchema,

    status: field({ type: String, enum: SPIN_STATUS.ALL, default: 'new' }),

    voucherCampaignId: field({
      type: String,
      label: 'Source Voucher Campaign',
      optional: true
    }),

    // won
    awardId: field({ type: String, label: 'Won award' }),
    voucherId: field({ type: String, label: 'Won Voucher', optional: true })
  }),
  'erxes_loyalty_spins'
);
