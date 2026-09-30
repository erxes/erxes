import { VoucherFormValues } from '../constants/voucherFormSchema';

export const VOUCHER_OWNER_LIMIT_PERIODS = [
  'year',
  'month',
  'campaign',
] as const;

export type TVoucherOwnerLimit = {
  count: number;
  period: (typeof VOUCHER_OWNER_LIMIT_PERIODS)[number];
};

/** The limit as the server takes it; null clears one that was set. */
export const toOwnerLimit = (
  data: Pick<VoucherFormValues, 'ownerLimitCount' | 'ownerLimitPeriod'>,
): TVoucherOwnerLimit | null =>
  data.ownerLimitCount
    ? { count: data.ownerLimitCount, period: data.ownerLimitPeriod }
    : null;
