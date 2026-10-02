import { TCreatedVia } from 'erxes-api-shared/core-types';

/**
 * What loyalty needs to know about a purchase to earn points on it. The
 * selling side fills it from its own records; loyalty never reads a deal or an
 * order itself.
 */
export interface ILoyaltyPurchaseItem {
  productId: string;
  // Money this line cost.
  amount: number;
  discounted?: boolean;
}

export interface ILoyaltyPurchase {
  totalAmount: number;
  // Paid with money, not with points.
  paidAmount: number;
  items?: ILoyaltyPurchaseItem[];
}

// Where a score change came from, so it can be told on that record too.
export interface ILoyaltyScoreSource {
  targetId?: string;
  // e.g. `sales:sales.deals`; the record whose timeline also gets the entry.
  targetType?: string;
  serviceName?: string;
  // Whom the change is recorded under; an automation's owner, a cashier.
  actorId?: string;
  // What produced it when nobody typed it in, e.g. the automation.
  createdVia?: TCreatedVia;
}

export interface IEarnInput extends ILoyaltyScoreSource {
  ownerType: string;
  ownerId: string;
  campaignId: string;
  purchase: ILoyaltyPurchase;
  earnRowKeys?: string[];
}

export interface ISpendInput extends ILoyaltyScoreSource {
  ownerType: string;
  ownerId: string;
  campaignId: string;
  // Money paid with points on this purchase; the whole amount, not a delta.
  pointsPaymentAmount: number;
  totalAmount: number;
}
