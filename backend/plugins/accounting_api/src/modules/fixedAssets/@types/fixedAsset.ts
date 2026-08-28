import { Document } from 'mongoose';

export interface IFixedAsset {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  status: string;

  propertiesData?: Record<string, unknown>;

  accountId?: string;
  count?: number;
  currentCount?: number;
  originalCost?: number;
  acquisitionDate?: Date;
  depreciationStartDate?: Date;
  transactionId?: string;
  transactionDetailId?: string;

  depreciationMethod?: string;
  usefulLife?: number;
  salvageValue?: number;
  taxDepreciationMethod?: string;
  taxUsefulLife?: number;
  taxSalvageValue?: number;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;
}

export interface IFixedAssetDocument extends IFixedAsset, Document {
  _id: string;
  createdAt: Date;
}
