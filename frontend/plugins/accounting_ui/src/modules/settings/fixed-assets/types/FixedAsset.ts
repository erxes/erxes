import { z } from 'zod';
import {
  fixedAssetCategorySchema,
  fixedAssetSchema,
} from '../constants/schema';

export interface IFixedAssetCategory {
  _id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  status?: string;
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
  accountId?: string;
  count?: number;
  currentCount?: number;
  originalCost?: number;
  acquisitionDate?: Date;
  depreciationStartDate?: Date;
  depreciationMethod?: string;
  usefulLife?: number;
  salvageValue?: number;
  taxDepreciationMethod?: string;
  taxUsefulLife?: number;
  taxSalvageValue?: number;
  propertiesData?: Record<string, unknown>;
}

export interface IFxaOwnerRecord {
  _id: string;
  fixedAssetId?: string;
  categoryId?: string;
  code?: string;
  sequence?: number;
  count?: number;
  action?: string;
  status?: string;
  ownerId?: string;
  transactionId?: string;
  transactionDetailId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;
}

export interface IFixedAssetLocationRemainder {
  fixedAssetId?: string;
  branchId?: string;
  departmentId?: string;
  remainder?: number;
}

export type TFixedAssetCategoryForm = z.infer<typeof fixedAssetCategorySchema>;

export type TFixedAssetForm = z.infer<typeof fixedAssetSchema>;
