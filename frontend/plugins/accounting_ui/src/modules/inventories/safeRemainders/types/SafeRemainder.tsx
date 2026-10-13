import type {
  AccountingSafeRemainderDetailQuery,
  AccountingSafeRemainderItemsQuery,
} from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';

export type ISafeRemainder = GraphqlView<
  NonNullable<AccountingSafeRemainderDetailQuery['safeRemainderDetail']>
>;

export type TSafeRemainderItemTrInfo = {
  activeCost?: number;
  unitCost?: number;
  isCostExplicit?: boolean;
  lastIncomePrice?: number;
  isSale?: boolean;
  unitPrice?: number;
};

export type TSafeRemainderImportItem = {
  productCode: string;
  count: number;
  trInfo?: Omit<TSafeRemainderItemTrInfo, 'activeCost'>;
};

type SafeRemainderItemResult = GraphqlView<
  NonNullable<
    NonNullable<AccountingSafeRemainderItemsQuery['safeRemainderItems']>[number]
  >
>;
export type ISafeRemainderItem = Omit<
  SafeRemainderItemResult,
  'count' | 'preCount'
> & { count: number; preCount: number };
export const toSafeRemainderItem = (
  item: SafeRemainderItemResult,
): ISafeRemainderItem => ({
  ...item,
  count: item.count ?? 0,
  preCount: item.preCount ?? 0,
});

export const SAFE_REMAINDER_STATUSES = {
  DRAFT: 'draft',
  DONE: 'done',
  PUBLISHED: 'published',
  ALL: ['draft', 'done', 'published'],
};

export const SAFE_REMAINDER_ITEM_STATUSES = {
  NEW: 'new',
  CHECKED: 'checked',
  ALL: ['new', 'checked'],
};
