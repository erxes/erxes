import {
  ILoyaltyAccountTypeDocument,
  ILoyaltyTier,
} from '@/score/@types/accountType';
import { setAccountTier } from '@/score/services/accountTier';
import {
  ACCOUNT_OWNER_TYPES,
  resolveBalanceOwner,
} from '@/score/services/scoreLedger';
import { tierForAmount, TTierBandsConfig } from '@/score/services/tierBands';
import { tierDirection } from '@/score/services/tierChanged';
import { IModels } from '~/connectionResolvers';
import { TTierChangeVia } from '@/score/@types/tierLog';

// Where two ranges meet the higher tier wins, however the bands were entered.
export const tierForPurchase = (
  tiers: ILoyaltyTier[],
  config: TTierBandsConfig,
  totalAmount: unknown,
) => {
  const orderOf = (key: string) =>
    tiers.find((tier) => tier.key === key)?.order ?? -1;

  return tierForAmount(
    {
      ...config,
      bands: [...(config.bands || [])].sort(
        (a, b) => orderOf(b.tier) - orderOf(a.tier),
      ),
    },
    totalAmount,
  );
};

// One owner's tier write; `keepHigher` leaves an owner whose tier would drop.
export const applyOwnerTier = async ({
  models,
  subdomain,
  accountType,
  ownerType,
  ownerId,
  tier,
  keepHigher,
  via,
}: {
  models: IModels;
  subdomain: string;
  accountType: ILoyaltyAccountTypeDocument;
  ownerType: string;
  ownerId: string;
  tier: string | null;
  keepHigher?: boolean;
  via?: TTierChangeVia;
}) => {
  const { accountOwnerType, recordId } = await resolveBalanceOwner(
    subdomain,
    ownerType,
    ownerId,
  );

  if (ACCOUNT_OWNER_TYPES[accountType.ownerType] !== accountOwnerType) {
    throw new Error(
      `${accountType.name} belongs to ${accountType.ownerType} owners, not ${ownerType}`,
    );
  }

  const account = await models.LoyaltyAccounts.ensureOwnerAccount({
    ownerType: accountOwnerType,
    ownerId: recordId,
  });
  const current = account.balances?.get(accountType._id)?.tier || null;

  if (
    keepHigher &&
    tierDirection(accountType.tiers, current, tier) === 'down'
  ) {
    return { from: current, to: current, changed: false };
  }

  const { from, to, changed } = await setAccountTier({
    models,
    subdomain,
    accountId: account._id,
    accountTypeId: accountType._id,
    tier: tier || null,
    via,
  });

  return { from, to, changed };
};
