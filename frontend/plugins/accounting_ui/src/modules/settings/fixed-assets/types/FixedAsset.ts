import { z } from 'zod';
import { fixedAssetCategorySchema, fixedAssetSchema } from '../constants/schema';

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
