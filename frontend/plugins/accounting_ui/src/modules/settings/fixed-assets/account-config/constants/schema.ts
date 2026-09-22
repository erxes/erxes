import { z } from 'zod';

export const fixedAssetAccountConfigSchema = z.object({
  accountId: z.string().min(1),
  value: z.object({
    accountId: z.string().optional(),
    depreciationAccountId: z.string().optional(),
    taxAssetAccountId: z.string().optional(),
    taxLiabilityAccountId: z.string().optional(),
    TaxExpenseAccountId: z.string().optional(),
  }),
});

export const FIXED_ASSET_ACCOUNT_CONFIG_DEFAULT_VALUES = {
  accountId: '',
  value: { accountId: '' },
};
