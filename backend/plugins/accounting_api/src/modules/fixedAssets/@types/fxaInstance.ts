import { Document } from 'mongoose';

export interface IFxaInstance {
  fixedAssetId: string;
  categoryId?: string;
  code: string;
  sequence?: number;
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

  transactionDetailId?: string;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;
}

export interface IFxaInstanceDocument extends IFxaInstance, Document {
  _id: string;
  createdAt: Date;
}
