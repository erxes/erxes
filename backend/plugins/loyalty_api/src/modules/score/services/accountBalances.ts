import {
  ILoyaltyAccountBalance,
  ILoyaltyAccountDocument,
} from '@/score/@types/account';
import { ILoyaltyAccountTypeDocument } from '@/score/@types/accountType';
import { IModels } from '~/connectionResolvers';

// Points that expire within this window show as "expiring soon".
const EXPIRING_SOON_DAYS = 30;

// Account types in creation order; `default` is the top-level score.
export const resolveAccountBalances = async (
  models: IModels,
  { _id, balances }: Pick<ILoyaltyAccountDocument, '_id' | 'balances'>,
) => {
  // A hydrated document holds a Map; a lean one (list queries) a plain object.
  const entries: [string, ILoyaltyAccountBalance][] =
    balances instanceof Map
      ? [...balances.entries()]
      : Object.entries(balances || {});
  const soon = new Date(Date.now() + EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000);
  const [accountTypes, expiring] = await Promise.all([
    models.LoyaltyAccountTypes.find({
      _id: { $in: entries.map(([key]) => key) },
    })
      .sort({ createdAt: 1 })
      .lean<ILoyaltyAccountTypeDocument[]>(),
    models.LoyaltyLots.aggregate<{
      _id: string;
      amount: number;
      expiresAt: Date;
    }>([
      {
        $match: {
          accountId: _id,
          status: 'available',
          remaining: { $gt: 0 },
          expiresAt: { $lte: soon },
        },
      },
      {
        $group: {
          _id: '$key',
          amount: { $sum: '$remaining' },
          expiresAt: { $min: '$expiresAt' },
        },
      },
    ]),
  ]);
  const byId = new Map(accountTypes.map((type) => [type._id, type]));
  const expiringByKey = new Map(
    expiring.map(({ _id: key, amount, expiresAt }) => [
      key,
      { amount, expiresAt },
    ]),
  );

  return entries
    .map(
      ([
        accountTypeId,
        { balance, pending, updatedAt, tier, tierSince, resetAt },
      ]) => {
        const accountType = byId.get(accountTypeId);

        return {
          accountTypeId,
          accountType: accountType || null,
          balance: balance ?? 0,
          pending: pending ?? 0,
          expiringSoon: expiringByKey.get(accountTypeId) || null,
          updatedAt,
          tier: tier
            ? accountType?.tiers?.find(({ key }) => key === tier) || null
            : null,
          tierSince,
          resetAt,
        };
      },
    )
    .sort(
      (a, b) =>
        (a.accountType ? 1 : 0) - (b.accountType ? 1 : 0) ||
        Number(a.accountType?.createdAt ?? 0) -
          Number(b.accountType?.createdAt ?? 0),
    );
};
