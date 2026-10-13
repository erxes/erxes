import { ILoyaltyAccountTypeDocument } from '@/score/@types/accountType';

type TLotPolicySource = Pick<
  ILoyaltyAccountTypeDocument,
  'expiry' | 'pendingDays'
> | null;

const addDays = (from: Date, days: number) =>
  new Date(from.getTime() + days * 24 * 60 * 60 * 1000);

const addMonths = (from: Date, months: number) => {
  const date = new Date(from);
  date.setMonth(date.getMonth() + months);
  return date;
};

// Dates are computed here rather than in queries so nothing needs MongoDB 5+.
export const getLotExpiry = (
  accountType: TLotPolicySource | undefined,
  from = new Date(),
) =>
  accountType?.expiry?.mode === 'rolling' && accountType.expiry.months
    ? addMonths(from, accountType.expiry.months)
    : undefined;

export const getPendingUntil = (
  accountType: TLotPolicySource | undefined,
  from = new Date(),
) =>
  accountType?.pendingDays && accountType.pendingDays > 0
    ? addDays(from, accountType.pendingDays)
    : undefined;
