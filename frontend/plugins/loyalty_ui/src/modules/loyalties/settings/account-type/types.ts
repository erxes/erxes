import { compactList } from '@/loyalties/utils/cursorList';
import type { LoyaltyAccountTypeFieldsFragment } from '~/gql/graphql';

export type TLoyaltyOwnerType = 'customer' | 'company' | 'user';

export type TLoyaltyAccountTypeStatus = 'active' | 'archived';

export type TLoyaltyFrozenBlocks = 'spending' | 'all';

export type TLoyaltyResetPeriod = 'never' | 'monthly' | 'yearly';

export type TLoyaltyTierResetTo = 'keep' | 'none' | 'lowest';

export type TLoyaltyExpiryMode = 'none' | 'calendar' | 'rolling';

// Who may earn into the wallet.
export type TLoyaltyEarnWho = 'all' | 'clientPortal' | 'segment';

export type ILoyaltyAccountType = LoyaltyAccountTypeFieldsFragment;

export type ILoyaltyTier = NonNullable<
  NonNullable<ILoyaltyAccountType['tiers']>[number]
>;

// Deprecated tiers stay on the account type for accounts still holding them.
export const activeTiers = (tiers?: readonly (ILoyaltyTier | null)[] | null) =>
  compactList(tiers)
    .filter(({ deprecated }) => !deprecated)
    .sort((a, b) => a.order - b.order);

export const LOYALTY_RESET_PERIODS: TLoyaltyResetPeriod[] = [
  'never',
  'monthly',
  'yearly',
];

export const LOYALTY_EXPIRY_MODES: TLoyaltyExpiryMode[] = [
  'none',
  'calendar',
  'rolling',
];

export const LOYALTY_TIER_RESET_TO: TLoyaltyTierResetTo[] = [
  'keep',
  'none',
  'lowest',
];

export const LOYALTY_ACCOUNT_TYPE_OWNER_TYPES: {
  value: TLoyaltyOwnerType;
  label: string;
}[] = [
  { value: 'customer', label: 'customers' },
  { value: 'company', label: 'companies' },
  { value: 'user', label: 'team-members' },
];
