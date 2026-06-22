import { z } from 'zod';
import { fixedAssetCategorySchema, fixedAssetSchema } from '../constants/schema';

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
  _id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  status?: string;
  accounts?: IFixedAssetAccounts;
  depreciationMethod?: string;
  defaultUsefulLife?: number;
  defaultSalvageValue?: number;
  taxDepreciationMethod?: string;
  defaultTaxUsefulLife?: number;
  defaultTaxSalvageValue?: number;
}

export interface IFixedAsset {
  _id: string;
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  status?: string;
  accounts?: IFixedAssetAccounts;
  depreciationMethod?: string;
  usefulLife?: number;
  salvageValue?: number;
  taxDepreciationMethod?: string;
  taxUsefulLife?: number;
  taxSalvageValue?: number;
  propertiesData?: Record<string, unknown>;
}

export type TFixedAssetCategoryForm = z.infer<
  typeof fixedAssetCategorySchema
>;

export type TFixedAssetForm = z.infer<typeof fixedAssetSchema>;
