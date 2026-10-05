import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export type TLoyaltyAccountStatus = 'active' | 'frozen' | 'closed';

// Owner of the record the balances live on; cpUser balances belong to the
// linked customer, so a cpUser never owns an account itself.
export type TLoyaltyAccountOwnerType = 'customer' | 'company' | 'user';

// Everything the owner holds under one account type: balance and tier.
export interface ILoyaltyAccountBalance {
  // Spendable; purchase earnings still pending sit in `pending`.
  balance?: number;
  pending?: number;
  // Set once the balance is backed by lots (see loyalty_lots).
  lots?: boolean;
  updatedAt?: Date;
  tier?: string;
  tierSince?: Date;
  // Start of the last period whose reset this balance went through.
  resetAt?: Date;
}

export interface ILoyaltyAccount {
  number: string;
  ownerType: TLoyaltyAccountOwnerType;
  ownerId: string;
  status: TLoyaltyAccountStatus;
  // Keyed by account type id; a projection of score_logs, like the featured field.
  balances: Map<string, ILoyaltyAccountBalance>;
  joinedAt: Date;
  frozenAt?: Date;
  frozenBy?: string;
  frozenReason?: string;
}

export interface ILoyaltyAccountDocument extends ILoyaltyAccount, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoyaltyAccountParams extends ICursorPaginateParams {
  // An account number, or text matched against owners' names and contacts.
  searchValue?: string;
  ownerType?: TLoyaltyAccountOwnerType;
  status?: TLoyaltyAccountStatus;
  accountTypeId?: string;
  // Needs accountTypeId; `none` means holding no tier there.
  tier?: string;
}
