import { Document } from 'mongoose';

export type TLoyaltyOwnerType = 'customer' | 'company' | 'user' | 'cpUser';

export type TLoyaltyAccountTypeStatus = 'active' | 'archived';

// What a frozen account can no longer do with balances of this type.
export type TLoyaltyFrozenBlocks = 'spending' | 'all';

export interface ILoyaltyTier {
  key: string;
  name: string;
  order: number;
  // Removed from the list; accounts may still hold it until they are moved.
  deprecated?: boolean;
}

// Input order is the tier order, lowest first; a missing key is a new tier.
export interface ILoyaltyTierInput {
  key?: string;
  name: string;
}

export type TLoyaltyResetPeriod = 'never' | 'monthly' | 'yearly';

// What a reset does to the tier: keep it, clear it, or drop to the lowest.
export type TLoyaltyTierResetTo = 'keep' | 'none' | 'lowest';

// The reset period drives calendar expiry and the tier reset.
export interface ILoyaltyAccountTypeReset {
  period: TLoyaltyResetPeriod;
  tierTo: TLoyaltyTierResetTo;
}

// none: points never expire; calendar: the balance clears at each reset
// period; rolling: each earning expires `months` after it was earned.
export type TLoyaltyExpiryMode = 'none' | 'calendar' | 'rolling';

export interface ILoyaltyAccountTypeExpiry {
  mode: TLoyaltyExpiryMode;
  months?: number;
}

export interface ILoyaltyAccountTypeResetState
  extends ILoyaltyAccountTypeReset {
  // Only period boundaries after this moment reset: turning a reset on never
  // wipes the period already running.
  since?: Date;
  lastBoundary?: Date;
}

export interface ILoyaltyAccountType {
  name: string;
  ownerType: TLoyaltyOwnerType;
  frozenBlocks?: TLoyaltyFrozenBlocks;
  tiers?: ILoyaltyTierInput[];
  reset?: ILoyaltyAccountTypeReset;
  expiry?: ILoyaltyAccountTypeExpiry;
  // Purchase earnings wait this many days before they can be spent.
  pendingDays?: number;
  // Earning: every currencyRatio of money spent is 1 point.
  currencyRatio?: number;
  // Spending: 1 point pays pointValue of money.
  pointValue?: number;
}

export interface ILoyaltyAccountTypeDocument
  extends Omit<ILoyaltyAccountType, 'tiers' | 'reset'>,
    Document {
  _id: string;
  tiers: ILoyaltyTier[];
  reset?: ILoyaltyAccountTypeResetState;
  fieldId?: string;
  tierFieldId?: string;
  status: TLoyaltyAccountTypeStatus;
  createdUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}
