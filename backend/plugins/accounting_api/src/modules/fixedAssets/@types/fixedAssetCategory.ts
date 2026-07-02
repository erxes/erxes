import { Document } from 'mongoose';

export interface IFixedAssetCategory {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  status: string;

  depreciationMethod?: string;
  defaultUsefulLife?: number;
  defaultSalvageValue?: number;
  taxDepreciationMethod?: string;
  defaultTaxUsefulLife?: number;
  defaultTaxSalvageValue?: number;

  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;
}

export interface IFixedAssetCategoryDocument
  extends IFixedAssetCategory, Document {
  _id: string;
  createdAt: Date;
}
