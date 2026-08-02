import { Document } from 'mongoose';

export interface IFixedAsset {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  status: string;

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
