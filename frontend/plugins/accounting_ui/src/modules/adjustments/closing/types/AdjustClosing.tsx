import type {
  AccountingAdjustClosingDetailQuery,
  AccountingAdjustClosingDetailQueryVariables,
} from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';

export type IAdjustClosing = GraphqlView<
  NonNullable<AccountingAdjustClosingDetailQuery['adjustClosingDetail']>
>;
export type IAdjustClosingDetailItem = NonNullable<
  IAdjustClosing['details']
>[number];
export type IClosingDetailEntry = NonNullable<
  IAdjustClosingDetailItem['entries']
>[number];
export type AdjustClosingDetailQueryData = AccountingAdjustClosingDetailQuery;
export type AdjustClosingDetailQueryVariables =
  AccountingAdjustClosingDetailQueryVariables;

export const ADJUST_CLOSING_STATUSES = [
  'draft',
  'process',
  'warning',
  'complete',
  'publish',
] as const;

export const ADJ_CLOSING_STATUSES = {
  DRAFT: 'draft',
  PROCESS: 'process',
  WARNING: 'warning',
  COMPLETE: 'complete',
  PUBLISH: 'publish',
} as const;
