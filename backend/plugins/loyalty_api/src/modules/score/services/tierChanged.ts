import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import { ILoyaltyTier } from '@/score/@types/accountType';
import { TLoyaltyAccountOwnerType } from '@/score/@types/account';
import {
  TierChangedTarget,
  TierChangedTriggerConfig,
  TTierDirection,
} from '~/meta/automations/types';

export const TIER_CHANGED_TRIGGER = 'loyalty:score.tier';

// No tier sits below every tier, so gaining one is always a move up.
export const tierDirection = (
  tiers: ILoyaltyTier[],
  from: string | null,
  to: string | null,
): TTierDirection => {
  const orderOf = (key: string | null) =>
    key ? tiers.find((tier) => tier.key === key)?.order ?? -1 : -1;

  return orderOf(to) > orderOf(from) ? 'up' : 'down';
};

export const sendTierChanged = (
  subdomain: string,
  {
    account,
    accountType,
    from,
    to,
  }: {
    account: {
      _id: string;
      ownerType: TLoyaltyAccountOwnerType;
      ownerId: string;
    };
    accountType: { _id: string; name: string; tiers?: ILoyaltyTier[] };
    from: string | null;
    to: string | null;
  },
) => {
  const target: TierChangedTarget = {
    _id: account.ownerId,
    ownerType: account.ownerType,
    ...(account.ownerType === 'customer'
      ? { customerId: account.ownerId }
      : {}),
    accountId: account._id,
    accountTypeId: accountType._id,
    accountTypeName: accountType.name,
    fromTier: from,
    toTier: to,
    direction: tierDirection(accountType.tiers || [], from, to),
  };

  sendAutomationTrigger(subdomain, {
    type: TIER_CHANGED_TRIGGER,
    targets: [target],
  });
};

export const matchesTierChanged = (
  config: TierChangedTriggerConfig,
  target: Partial<TierChangedTarget>,
) =>
  !!config.accountTypeId &&
  target.accountTypeId === config.accountTypeId &&
  (!config.toTier || target.toTier === config.toTier) &&
  (!config.direction ||
    config.direction === 'any' ||
    target.direction === config.direction);
