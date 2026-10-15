import type { VouchersMainQuery } from '~/gql/graphql';

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

export type TVoucherRow = NonNullable<
  NonNullable<NonNullable<VouchersMainQuery['vouchersMain']>['list']>[number]
>;

export type IVoucher = Omit<
  TVoucherRow,
  'terms' | 'usedIn' | 'createdVia' | 'history'
> & {
  terms: IVoucherTerms | null;
  usedIn: { targetType?: string; targetId?: string; note?: string } | null;
  createdVia: { source?: string; sourceName?: string } | null;
  history: IVoucherHistoryEntry[];
};
