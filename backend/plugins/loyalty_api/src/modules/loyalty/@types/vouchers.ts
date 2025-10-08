import { ICommonDocument, ICommonFields } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';
import { VOUCHER_STATUS } from './constants';

export interface IVoucher extends ICommonFields {
  status?: string;
  bonusInfo?: any;

  config?: any;
}

export interface IVoucherDocument extends IVoucher, ICommonDocument, Document {
  _id: string;
}
