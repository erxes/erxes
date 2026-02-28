import { commonSchema, ICommonDocument, ICommonFields } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';
import { VOUCHER_STATUS } from './constants';

export interface IVoucher extends ICommonFields {
  status?: string;
  bonusInfo?: any;

  config?: any
}

export interface IVoucherDocument extends IVoucher, ICommonDocument, Document {
  _id: string;
}

export const voucherSchema = schemaHooksWrapper(
  new Schema({
    ...commonSchema,

    status: field({
      type: String,
      enum: VOUCHER_STATUS.ALL,
      default: 'new',
      label: 'Status'
    }),
    // etc: bonus-> usedCount
    bonusInfo: field({ type: Object, optional: true, label: 'Bonus log' }),

    // Optional voucher configuration for standalone config (not tied to campaigns)
    config: field({ type: Object, optional: true, label: 'Config' })
  }),
  'erxes_loyalty_vouchers'
);

voucherSchema.index({ ownerId: 1 });