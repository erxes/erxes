import { z } from 'zod';
import { fixedAssetAccountConfigSchema } from '../constants/schema';

export interface IFixedAssetAccountConfig {
  _id: string;
  accountId: string;
  value: {
    accountId: string;
    depreciationAccountId?: string;
    taxAssetAccountId?: string;
    taxLiabilityAccountId?: string;
    TaxExpenseAccountId?: string;
  };
}

export type TFixedAssetAccountConfigForm = z.infer<
  typeof fixedAssetAccountConfigSchema
>;
