import type {
  AccountingAdjustClosingDetailQuery,
  AccountingAdjustClosingDetailQueryVariables,
} from '~/gql/graphql';
import type { GraphqlView } from '@/utils/graphql';

export type IAdjustClosing = GraphqlView<
  NonNullable<AccountingAdjustClosingDetailQuery['adjustClosingDetail']>
>;
export type IAdjustClosingDetail = IAdjustClosing;
export type IAdjustClosingDetailItem = NonNullable<
  IAdjustClosing['details']
>[number];
export type IClosingDetailEntry = NonNullable<
  IAdjustClosingDetailItem['entries']
>[number];
export type AdjustClosingDetailQueryData = AccountingAdjustClosingDetailQuery;
export type AdjustClosingDetailQueryVariables =
  AccountingAdjustClosingDetailQueryVariables;
