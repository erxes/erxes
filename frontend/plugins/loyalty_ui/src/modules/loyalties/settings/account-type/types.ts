export type TLoyaltyOwnerType = 'customer' | 'company' | 'user';

export type TLoyaltyAccountTypeStatus = 'active' | 'archived';

export type TLoyaltyFrozenBlocks = 'spending' | 'all';

export type TLoyaltyResetPeriod = 'never' | 'monthly' | 'yearly';

export type TLoyaltyTierResetTo = 'keep' | 'none' | 'lowest';

export interface ILoyaltyTier {
  key: string;
  name: string;
  order: number;
  deprecated?: boolean;
}

export interface ILoyaltyAccountTypeReset {
  period: TLoyaltyResetPeriod;
  tierTo?: TLoyaltyTierResetTo;
}

export type TLoyaltyExpiryMode = 'none' | 'calendar' | 'rolling';

export interface ILoyaltyAccountTypeExpiry {
  mode: TLoyaltyExpiryMode;
  months?: number | null;
}

export interface ILoyaltyAccountType {
  _id: string;
  name: string;
  ownerType: TLoyaltyOwnerType;
  frozenBlocks?: TLoyaltyFrozenBlocks;
  tiers?: ILoyaltyTier[] | null;
  reset?: ILoyaltyAccountTypeReset | null;
  expiry?: ILoyaltyAccountTypeExpiry | null;
  pendingDays?: number | null;
  currencyRatio?: number | null;
  pointValue?: number | null;
  fieldId?: string;
  status: TLoyaltyAccountTypeStatus;
  campaignCount?: number;
  createdAt?: string;
}

export interface ILoyaltyAccountTypeAdoption {
  adopted: { accountTypeId: string; name: string; campaigns: number }[];
  skipped: { fieldId: string; reason: string }[];
}

// Deprecated tiers stay on the account type for accounts still holding them.
export const activeTiers = (tiers?: ILoyaltyTier[] | null) =>
  (tiers || [])
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
