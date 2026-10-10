import { TCreatedVia } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { TLoyaltyAccountOwnerType } from '@/score/@types/account';
import { TTierDirection } from '~/meta/automations/types';

// Who or what moved a tier, and the record it moved for.
export type TTierChangeVia = {
  createdBy?: string;
  createdVia?: TCreatedVia;
  targetId?: string;
  targetType?: string;
  // What the record was called then, given by its own plugin.
  targetName?: string;
};

export interface ILoyaltyTierLog extends TTierChangeVia {
  accountId: string;
  ownerType: TLoyaltyAccountOwnerType;
  ownerId: string;
  accountTypeId: string;
  fromTier: string | null;
  toTier: string | null;
  direction: TTierDirection;
}

export interface ILoyaltyTierLogDocument extends ILoyaltyTierLog, Document {
  _id: string;
  createdAt: Date;
}
