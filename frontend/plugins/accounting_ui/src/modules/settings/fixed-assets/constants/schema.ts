import { z } from 'zod';
import { FIXED_ASSET_DEPRECIATION_METHOD_VALUES } from './depreciationMethods';

const undefed = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value === null ? undefined : value),
    schema.optional(),
  );

export const fixedAssetCategorySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.string().optional(),
  depreciationMethod: z.enum(FIXED_ASSET_DEPRECIATION_METHOD_VALUES).optional(),
  defaultUsefulLife: z.coerce.number().optional(),
  defaultSalvageValue: z.coerce.number().optional(),
  taxDepreciationMethod: z
    .enum(FIXED_ASSET_DEPRECIATION_METHOD_VALUES)
    .optional(),
  defaultTaxUsefulLife: z.coerce.number().optional(),
  defaultTaxSalvageValue: z.coerce.number().optional(),
});

export const fixedAssetSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  depreciationMethod: z.enum(FIXED_ASSET_DEPRECIATION_METHOD_VALUES).optional(),
  usefulLife: z.coerce.number().optional(),
  salvageValue: z.coerce.number().optional(),
  taxDepreciationMethod: z
    .enum(FIXED_ASSET_DEPRECIATION_METHOD_VALUES)
    .optional(),
  taxUsefulLife: z.coerce.number().optional(),
  taxSalvageValue: z.coerce.number().optional(),
  propertiesData: undefed(z.record(z.string(), z.unknown())),
});
