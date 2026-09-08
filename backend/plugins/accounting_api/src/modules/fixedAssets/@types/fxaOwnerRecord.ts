import { Document } from 'mongoose';

export interface IFxaOwnerRecord {
  fixedAssetId: string;
  code: string;
  sequence?: number;
  count?: number;
  action?: string;
  status: string;

  ownerId?: string;

  transactionId?: string;
  transactionDetailId?: string;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;
}

export interface IFxaOwnerRecordDocument extends IFxaOwnerRecord, Document {
  _id: string;
  createdAt: Date;
}
