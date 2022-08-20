import { commonSchema, ICommonDocument, ICommonFields } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';
import { VOUCHER_STATUS } from './constants';

export interface IVoucher extends ICommonFields {
  status?: string;
  bonusInfo?: any;
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
    bonusInfo: field({ type: Object, optional: true, label: 'Bonus log' })
  }),
  'erxes_loyalty_vouchers'
);
