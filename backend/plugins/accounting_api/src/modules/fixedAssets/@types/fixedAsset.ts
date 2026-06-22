import { Document } from 'mongoose';
import { IFixedAssetAccounts } from './fixedAssetCategory';

export interface IFixedAsset {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  status: string;

  accounts?: IFixedAssetAccounts;
  propertiesData?: Record<string, unknown>;

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
