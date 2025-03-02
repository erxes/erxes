import { Document, Schema } from 'mongoose';
import { ICommonDocument, ICommonFields } from './common';
import { CODE_STATUS } from './constants';

interface IVoucherCodeUsedBy {
  ownerId: string;
  ownerType: string;
  usedAt: Date;
}

export interface IVoucherCode extends ICommonFields {
  code: string;
  status: string;
  usageCount: number;
  usageLimit: number;
  usedBy: IVoucherCodeUsedBy[];
  allowRepeatRedemption: boolean;
}

export interface IVoucherCodeDocument
  extends IVoucherCode,
    ICommonDocument,
    Document {
  _id: string;
}

export const voucherCodeSchema = new Schema({
  campaignId: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: CODE_STATUS.ALL,
    default: 'new',
    label: 'Status',
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usageLimit: {
    type: Number,
    required: true,
  },
  usedBy: [
    {
      _id: false,
      ownerId: { type: String },
      ownerType: { type: String },
      usedAt: { type: Date },
    },
  ],
  allowRepeatRedemption: {
    type: Boolean,
    default: false
  }
});
