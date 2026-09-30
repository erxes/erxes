import { IScoreOwner } from '../scores/types/score';
import { ILoyaltyTier } from '../settings/account-type/types';

export type TLoyaltyAccountStatus = 'active' | 'frozen' | 'closed';

export interface ILoyaltyAccountBalance {
  accountTypeId: string;
  accountType?: {
    _id: string;
    name: string;
    status: string;
    tiers?: ILoyaltyTier[] | null;
  } | null;
  balance: number;
  pending?: number | null;
  expiringSoon?: { amount: number; expiresAt: string } | null;
  updatedAt?: string;
  tier?: ILoyaltyTier | null;
  tierSince?: string;
}

export interface ILoyaltyAccount {
  _id: string;
  number: string;
  status: TLoyaltyAccountStatus;
  balances: ILoyaltyAccountBalance[];
  joinedAt?: string;
  frozenAt?: string;
  frozenReason?: string;
  // Present on list rows; the owner card already knows whose account it is.
  ownerType?: string;
  ownerId?: string;
  owner?: IScoreOwner | null;
}
