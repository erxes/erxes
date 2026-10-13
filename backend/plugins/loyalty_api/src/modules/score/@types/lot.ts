import { Document } from 'mongoose';

export type TLoyaltyLotStatus = 'pending' | 'available' | 'closed';

// One earning of a balance: spending takes from lots soonest-expiring first,
// so rolling expiry knows exactly what is left of each earning.
export interface ILoyaltyLot {
  accountId: string;
  // Account type id, or 'default' for the top-level score.
  key: string;
  sourceLogId?: string;
  amount: number;
  remaining: number;
  availableAt: Date;
  expiresAt?: Date;
  // expiresAt, or a far date for lots that never expire; the FIFO order.
  sortAt: Date;
  status: TLoyaltyLotStatus;
  // Set while the nightly run moves the lot, so two runs never both do.
  releasingAt?: Date;
  expiringAt?: Date;
}

export interface ILoyaltyLotDocument extends ILoyaltyLot, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
