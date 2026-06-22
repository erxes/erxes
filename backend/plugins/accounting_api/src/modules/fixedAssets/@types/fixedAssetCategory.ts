import { Document } from 'mongoose';

export interface IFixedAssetAccounts {
  fixedAssetAccountId?: string;
  accumulatedDepreciationAccountId?: string;
  depreciationExpenseAccountId?: string;
  gainAccountId?: string;
  lossAccountId?: string;
  revaluationReserveAccountId?: string;
  deferredTaxAssetAccountId?: string;
  deferredTaxLiabilityAccountId?: string;
  incomeTaxExpenseAccountId?: string;
}

export interface IFixedAssetCategory {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  status: string;

  accounts?: IFixedAssetAccounts;

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
  extends IFixedAssetCategory,
    Document {
  _id: string;
  createdAt: Date;
}
