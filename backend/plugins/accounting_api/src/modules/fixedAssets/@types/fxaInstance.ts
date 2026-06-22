import { Document } from 'mongoose';

export interface IFxaInstance {
  fixedAssetId: string;
  categoryId?: string;
  code: string;
  status: string;

  originalCost: number;
  depreciationMethod?: string;
  usefulLife?: number;
  salvageValue?: number;
  taxDepreciationMethod?: string;
  taxUsefulLife?: number;
  taxSalvageValue?: number;
  acquisitionDate: Date;
  depreciationStartDate?: Date;
  lastDepreciationDate?: Date;

  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  locationId?: string;

  transactionId?: string;
  transactionDetailId?: string;
  acquisitionTransactionId?: string;
  acquisitionTrDetailId?: string;
  disposalDate?: Date;
  disposalTransactionId?: string;
  disposalTrDetailId?: string;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;
}

export interface IFxaInstanceDocument extends IFxaInstance, Document {
  _id: string;
  createdAt: Date;
}
