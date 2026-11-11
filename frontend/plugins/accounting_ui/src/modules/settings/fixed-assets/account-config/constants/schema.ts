import { z } from 'zod';

export const fixedAssetAccountConfigSchema = z.object({
  accountId: z.string().min(1),
  value: z.object({
    accountId: z.string().optional(),
    depreciationAccountId: z.string().optional(),
    taxAssetAccountId: z.string().optional(),
    taxLiabilityAccountId: z.string().optional(),
    TaxExpenseAccountId: z.string().optional(),
    revaluationReserveAccountId: z.string().optional(),
    revaluationLossAccountId: z.string().optional(),
  }),
});

export const FIXED_ASSET_RELATED_ACCOUNT_FIELDS = [
  ['depreciationAccountId', 'accumulated-depreciation-offset-account'],
  ['taxAssetAccountId', 'deferred-tax-asset-account'],
  ['taxLiabilityAccountId', 'deferred-tax-liability-account'],
  ['TaxExpenseAccountId', 'income-tax-expense-account'],
  ['revaluationReserveAccountId', 'revaluation-reserve-account'],
  ['revaluationLossAccountId', 'revaluation-loss-account'],
] as const;

export const FIXED_ASSET_ACCOUNT_CONFIG_DEFAULT_VALUES = {
  accountId: '',
  value: { accountId: '' },
};
