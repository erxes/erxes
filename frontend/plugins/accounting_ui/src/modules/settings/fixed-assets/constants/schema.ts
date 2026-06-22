import { z } from 'zod';

export const fixedAssetAccountsSchema = z
  .object({
    fixedAssetAccountId: z.string().optional(),
    accumulatedDepreciationAccountId: z.string().optional(),
    depreciationExpenseAccountId: z.string().optional(),
    gainAccountId: z.string().optional(),
    lossAccountId: z.string().optional(),
    revaluationReserveAccountId: z.string().optional(),
    deferredTaxAssetAccountId: z.string().optional(),
    deferredTaxLiabilityAccountId: z.string().optional(),
    incomeTaxExpenseAccountId: z.string().optional(),
  })
  .optional();

export const fixedAssetCategorySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.string().optional(),
  accounts: fixedAssetAccountsSchema,
  depreciationMethod: z.string().optional(),
  defaultUsefulLife: z.coerce.number().optional(),
  defaultSalvageValue: z.coerce.number().optional(),
  taxDepreciationMethod: z.string().optional(),
  defaultTaxUsefulLife: z.coerce.number().optional(),
  defaultTaxSalvageValue: z.coerce.number().optional(),
});

export const fixedAssetSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  accounts: fixedAssetAccountsSchema,
  depreciationMethod: z.string().optional(),
  usefulLife: z.coerce.number().optional(),
  salvageValue: z.coerce.number().optional(),
  taxDepreciationMethod: z.string().optional(),
  taxUsefulLife: z.coerce.number().optional(),
  taxSalvageValue: z.coerce.number().optional(),
  propertiesData: z.record(z.string(), z.unknown()).optional(),
});
