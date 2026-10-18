export type TVoucherStatus =
  | 'new'
  | 'onhold'
  | 'used'
  | 'cancelled'
  | 'expired';

export interface IVoucherTerms {
  title?: string;
  voucherType?: string;
  kind?: string;
  value?: number;
  restrictions?: {
    minimumSpend?: number;
    maximumSpend?: number;
    categoryIds?: string[];
    excludeCategoryIds?: string[];
    productIds?: string[];
    excludeProductIds?: string[];
    tag?: string[];
    orExcludeTag?: string[];
  };
  bonusProductId?: string;
  bonusCount?: number;
}

export interface IVoucherHistoryEntry {
  action: string;
  at: string;
  by?: string;
  targetType?: string;
  targetId?: string;
  note?: string;
}

export interface IVoucher {
  _id: string;
  campaignId?: string;
  voucherCampaignId?: string;
  ownerType?: string;
  ownerId?: string;
  owner?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    primaryEmail?: string;
    primaryPhone?: string;
    primaryName?: string;
  };
  status?: string;
  createdAt?: string;
  usedAt?: string;
  terms?: IVoucherTerms | null;
  expiresAt?: string | null;
  usedIn?: { targetType?: string; targetId?: string; note?: string } | null;
  heldAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdVia?: { source?: string; sourceName?: string } | null;
  history?: IVoucherHistoryEntry[] | null;
}
